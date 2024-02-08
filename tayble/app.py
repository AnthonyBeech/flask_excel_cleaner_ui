# Standard imports
from flask import Flask, render_template, request, redirect, url_for, session

# Custom imports
from utils import excel_to_html, excel_to_csv, list_excel_files

# Globals
DIR = "data"


# App
app = Flask(__name__)
app.secret_key = "your_secret_key"


# Routes
@app.route("/", methods=["GET", "POST"])
def home():
    excel_files = list_excel_files()
    selected_file = excel_files[0]

    if request.method == "POST":
        selected_file = request.form.get("excel_file")

    path_to_excel = f"{DIR}/{selected_file}"
    session["path_to_excel"] = path_to_excel
    table_htmls = excel_to_html(path_to_excel)

    return render_template(
        "index.html",
        tables=table_htmls,
        path=path_to_excel,
        excel_files=excel_files,
        selected_file=selected_file,
    )


@app.route("/save-coords", methods=["POST"])
def save_coords():
    data = request.json
    coords = data.get("coords")
    sheet_id = data.get("sheetIndex")

    excel_to_csv(session.get("path_to_excel"), coords, sheet_id)

    return redirect(url_for("home"))


# Entry point
if __name__ == "__main__":
    app.run(debug=True)
