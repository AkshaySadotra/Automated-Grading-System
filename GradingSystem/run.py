# Flask Backend Server
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()

from AutomatedGradingFeedback.AutomatedGradingFeedback import Automated_Grading_Feedback

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Hello from Flask"})

@app.route("/UploadFiles", methods=["POST"])
def upload_files():
    study_zip = request.files.get('StudyFiles')
    assignment_zip = request.files.get('AssignmentFiles')

    if not study_zip or not assignment_zip:
        return jsonify({"error": "Both StudyFiles and AssignmentFiles ZIPs are required."}), 400

    from AutomatedGradingFeedback.ZipHandler import process_uploaded_zip
    try:
        study_folder_id, err1 = process_uploaded_zip(study_zip, "StudyMaterial")
        assignment_folder_id, err2 = process_uploaded_zip(assignment_zip, "Assignments", study_material_id=study_folder_id)
        
        if err1 or err2:
            return jsonify({"error": f"{err1 or ''} {err2 or ''}"}), 500
            
        return jsonify({
            "message": "Files uploaded and processed successfully!",
            "studyFolderId": study_folder_id,
            "assignmentFolderId": assignment_folder_id
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/AutomatedGradingFeedback", methods=["GET", "POST"])
def grading_feedback():
    if request.method == "POST":
        # Check if we received actual ZIP files (Backward compatibility)
        study_zip = request.files.get('StudyFiles')
        assignment_zip = request.files.get('AssignmentFiles')
        
        # Check if we received folder IDs (from FormData or JSON body)
        study_id_str = request.form.get('StudyFiles')
        assignment_id_str = request.form.get('AssignmentFiles')
        if not study_id_str and request.is_json:
            study_id_str = request.json.get('StudyFiles')
        if not assignment_id_str and request.is_json:
            assignment_id_str = request.json.get('AssignmentFiles')
        
        if study_zip and assignment_zip:
            from AutomatedGradingFeedback.ZipHandler import process_uploaded_zip
            study_folder_id, err1 = process_uploaded_zip(study_zip, "StudyMaterial")
            assignment_folder_id, err2 = process_uploaded_zip(assignment_zip, "Assignments", study_material_id=study_folder_id)
            if err1 or err2: return jsonify({"error": f"{err1 or ''} {err2 or ''}"}), 500
            return Automated_Grading_Feedback(study_folder_id, assignment_folder_id)
            
        elif study_id_str and assignment_id_str:
            return Automated_Grading_Feedback(study_id_str, assignment_id_str)
            
        return jsonify({"error": "Required files or IDs missing."}), 400
        
    StudyFiles, AssignmentFiles = request.args.get('StudyFiles'), request.args.get('AssignmentFiles')
    return Automated_Grading_Feedback(StudyFiles, AssignmentFiles)

@app.route("/UploadHistory", methods=["GET"])
def upload_history():
    import pyodbc
    import os

    server = os.getenv('SERVER')
    database = os.getenv('DATABASE')
    
    try:
        conn = pyodbc.connect(
            f"Driver={{ODBC Driver 17 for SQL Server}};"
            f"Server={server};Database={database};Trusted_Connection=yes;"
        )
        cursor = conn.cursor()
        
        # Single query: Get all assignments with their linked study material folder name
        cursor.execute("""
            SELECT 
                a.FolderId,
                a.FolderName,
                a.UploadedAt,
                a.studyMaterialid,
                a.Response,
                s.FolderName AS StudyFolderName
            FROM [AutomatedGrading].[dbo].[AssignmentsFolderUploads] a
            LEFT JOIN [AutomatedGrading].[dbo].[StudyMaterialFolderUploads] s 
                ON UPPER(a.studyMaterialid) = UPPER(CAST(s.FolderId AS NVARCHAR(250)))
            ORDER BY a.UploadedAt DESC
        """)

        # Build a dict keyed by assignment FolderId to deduplicate
        assignments = {}
        for row in cursor.fetchall():
            fid = str(row[0]).strip()
            if fid not in assignments:
                assignments[fid] = {
                    "assignmentFolderId": fid,
                    "assignmentFolder": row[1],
                    "uploadedAt": row[2].strftime("%Y-%m-%d %H:%M:%S") if row[2] else "",
                    "studyMaterialId": str(row[3]).strip() if row[3] else None,
                    "savedResponse": row[4] if row[4] else None,
                    "studyMaterialFolder": row[5] if row[5] else "—",
                    "assignmentFiles": [],
                    "studyMaterialFiles": []
                }

        # Get assignment contained files
        cursor.execute("""
            SELECT FolderId, FileName 
            FROM [AutomatedGrading].[dbo].[AssignmentsContainedFiles]
        """)
        for row in cursor.fetchall():
            fid = str(row[0]).strip()
            if fid in assignments:
                assignments[fid]["assignmentFiles"].append(row[1])

        # Get study material contained files for the linked folders
        study_ids = [a["studyMaterialId"] for a in assignments.values() if a["studyMaterialId"]]
        if study_ids:
            placeholders = ','.join(['?' for _ in study_ids])
            cursor.execute(f"""
                SELECT FolderId, FileName 
                FROM [AutomatedGrading].[dbo].[StudyMaterialContainedFiles]
                WHERE CAST(FolderId AS NVARCHAR(250)) IN ({placeholders})
            """, study_ids)
            for row in cursor.fetchall():
                sfid = str(row[0]).strip()
                # Find which assignment links to this study material
                for a in assignments.values():
                    if a["studyMaterialId"] == sfid:
                        a["studyMaterialFiles"].append(row[1])

        history = list(assignments.values())
        # Already sorted by UploadedAt DESC from the query

        return jsonify({"history": history})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.route("/SaveFeedback", methods=["POST"])
def save_feedback():
    import pyodbc
    import os
    
    data = request.json
    folder_id = data.get("assignmentFolderId")
    response_text = data.get("responseContent")
    
    if not folder_id or not response_text:
        return jsonify({"error": "Missing assignmentFolderId or responseContent"}), 400
        
    server = os.getenv('SERVER')
    database = os.getenv('DATABASE')
    
    try:
        conn = pyodbc.connect(
            f"Driver={{ODBC Driver 17 for SQL Server}};"
            f"Server={server};Database={database};Trusted_Connection=yes;"
        )
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE [AutomatedGrading].[dbo].[AssignmentsFolderUploads]
            SET Response = ?
            WHERE FolderId = ?
        """, (response_text, folder_id))
        
        conn.commit()
        return jsonify({"message": "Feedback saved successfully!"})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)