from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)


def load_data():
    items_data = pd.read_excel('data.xlsx', sheet_name='items')
    models_data = pd.read_excel('data.xlsx', sheet_name='models')
    return items_data['Item'].tolist(), models_data


items, models_df = load_data()


@app.route('/')
def index():
    return render_template('index.html', items=items)


@app.route('/get_models', methods=['POST'])
def get_models():
    selected_item = request.json.get('item')
    if not selected_item:
        return jsonify({"error": "No item selected"}), 400

    filtered_models = models_df[models_df['Item'] == selected_item]
    models = filtered_models.to_dict(orient='records')
    return jsonify(models)


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    model = data.get('model')
    quantity = data.get('quantity', 1)

    selected_model = models_df[models_df['Model'] == model]
    if selected_model.empty:
        return jsonify({"error": "Model not found"}), 404

    unit_price = float(selected_model['Price'].values[0])
    description = selected_model['Description'].values[0]
    total = unit_price * quantity
    vat = total * 0.15
    total_with_vat = total + vat

    return jsonify({
        "unit_price": unit_price,
        "description": description,
        "total": total,
        "vat": vat,
        "total_with_vat": total_with_vat
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4910, debug=True)
