# `app.py`
from flask_cors import CORS
from flask import Flask, jsonify, request, render_template
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load data from Excel
EXCEL_FILE = 'data/data.xlsx'


def load_data():
    items_data = pd.read_excel(EXCEL_FILE, sheet_name='items')
    models_data = pd.read_excel(EXCEL_FILE, sheet_name='models')
    return items_data, models_data


items_df, models_df = load_data()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/get_items', methods=['GET'])
def get_items():
    items = items_df['Item'].dropna().tolist()
    print("Serving items:", items)  # debugging
    return jsonify(items)


@app.route('/get_models', methods=['POST'])
def get_models():
    selected_item = request.json.get('item')
    if not selected_item:
        return jsonify([])

    filtered_models = models_df[models_df['Item'] == selected_item]
    models_list = filtered_models[['Model', 'Description', 'Price']].to_dict(orient='records')
    return jsonify(models_list)


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    item = data.get('item')
    model = data.get('model')
    quantity = int(data.get('quantity', 0))

    if not item or not model or quantity <= 0:
        return jsonify({'error': 'Invalid input'}), 400

    filtered_models = models_df[(models_df['Item'] == item) & (models_df['Model'] == model)]
    if filtered_models.empty:
        return jsonify({'error': 'Model not found'}), 404

    unit_price = float(filtered_models['Price'].iloc[0])

    if item == 'Book':
        pages = int(data.get('pages', 0))
        binding_type = data.get('binding_type')

        if not pages or not binding_type:
            return jsonify({'error': 'Invalid input for books'}), 400

        binding_prices = {
            'Spiral Binding': 1.5,
            'Saddle Stitch': 2.0,
            'Perfect Bound': 2.5,
            'Hard Cover': 5.0
        }

        binding_price = binding_prices.get(binding_type, 0)
        unit_price = unit_price * pages + binding_price

    total = unit_price * quantity
    vat = total * 0.15
    total_with_vat = total + vat
    print("Received data:", request.json)

    return jsonify({
        'unit_price': round(unit_price, 2),
        'total': round(total, 2),
        'vat': round(vat, 2),
        'total_with_vat': round(total_with_vat, 2)
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4911, debug=True)
