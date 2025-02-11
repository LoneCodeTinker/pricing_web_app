from flask import Flask, jsonify, request, render_template
import pandas as pd

app = Flask(__name__)

# Load data from Excel file
EXCEL_FILE = 'data.xlsx'


def load_data():
    try:
        xls = pd.ExcelFile(EXCEL_FILE)
        data_frames = {sheet: pd.read_excel(xls, sheet_name=sheet) for sheet in xls.sheet_names}

        models_df = data_frames.get('models', pd.DataFrame())

        # Extract unique items from the models sheet
        items = models_df['Item'].dropna().unique().tolist() if 'Item' in models_df else []
        # print(data_frames)  # debug line

        return data_frames, models_df, items
    except Exception as e:
        print(f"Error loading data: {e}")
        return {}, None, []


# Load data
data, models_df, items_list = load_data()


@app.route('/')
def index():
    return render_template('index.html', items=items_list)


@app.route('/get_models', methods=['POST'])
def get_models():
    data = request.json
    selected_item = data.get('item', '')

    if selected_item and models_df is not None:
        models = models_df[models_df['Item'] == selected_item].copy()
        models.fillna('', inplace=True)
        response = models[['Model', 'Description', 'Price']].to_dict(orient='records')
        return jsonify(response)
    else:
        return jsonify([])


@app.route('/get_book_pricing', methods=['GET'])
def get_book_pricing():
    if 'book pricing' in data:
        book_pricing_df = data['book pricing']
        book_pricing_df.fillna('', inplace=True)
        response = book_pricing_df[['binding type', 'binding cost']].to_dict(orient='records')
        return jsonify(response)
    else:
        return jsonify([])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4910, debug=True)
