import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


# Load data from Excel
def load_data():
    items_data = pd.read_excel('data.xlsx', sheet_name='items')
    models_data = pd.read_excel('data.xlsx', sheet_name='models')
    return items_data, models_data


# # Load data
items_df, models_df = load_data()


@app.route('/')
def index():
    items = items_df['Item'].tolist()
    return render_template('index.html', items=items)


@app.route('/get_models', methods=['POST'])
def get_models():
    item = request.json['item']
    models = models_df[models_df['Item'] == item][['Model', 'Description', 'Price']].to_dict(orient='records')
    return jsonify({'models': models})


@app.route('/calculate_price', methods=['POST'])
def calculate_price():
    model = request.json['model']
    quantity = int(request.json['quantity'])

    # Fetch the unit price and description for the selected model
    model_row = models_df[models_df['Model'] == model].iloc[0]
    unit_price = model_row['Price']
    description = model_row['Description']

    # Perform calculations
    total = unit_price * quantity
    vat = total * 0.15
    total_with_vat = total + vat

    return jsonify({
        'description': description,
        'unit_price': unit_price,
        'total': total,
        'vat': vat,
        'total_with_vat': total_with_vat
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4910, debug=True)
