import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


# Load data from Excel
def load_data():
    excel_file = pd.ExcelFile('data.xlsx')
    print("Available sheets:", excel_file.sheet_names)  # Debugging line
    items_df = excel_file.parse(sheet_name='items')
    models_df = excel_file.parse(sheet_name='models')
    return items_df['Item'].tolist(), models_df


# Load items and models at the start
items, models_data = load_data()


@app.route('/')
def index():
    return render_template('index.html', items=items)


@app.route('/get_models', methods=['POST'])
def get_models():
    item = request.json['item']
    filtered_models = models_data[models_data['Item'] == item]['Model'].tolist()
    return jsonify({'models': filtered_models})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4910, debug=True)
