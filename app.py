from flask import Flask, jsonify, request, render_template
import pandas as pd
import os

app = Flask(__name__)

# Load data from Excel file
EXCEL_FILE = 'data.xlsx'


# def load_data():
#     try:
#         items_df = pd.read_excel(EXCEL_FILE, sheet_name='items')
#         models_df = pd.read_excel(EXCEL_FILE, sheet_name='models')
#         return items_df, models_df
#     except Exception as e:
#         print(f"Error loading data: {e}")
#         return None, None
def load_data():
    try:
        # Load all sheets from the Excel file
        xls = pd.ExcelFile(EXCEL_FILE)
        sheet_names = xls.sheet_names  # Get sheet names
        data_frames = {}

        # Read each sheet into a DataFrame
        for sheet in sheet_names:
            data_frames[sheet] = pd.read_excel(xls, sheet_name=sheet)

        # Extract specific sheets for direct use
        items_df = data_frames.get('items', pd.DataFrame())
        models_df = data_frames.get('models', pd.DataFrame())

        return data_frames, items_df, models_df
    except Exception as e:
        print(f"Error loading data: {e}")
        return {}, None, None


# Call the function and get the results
data, items_df, models_df = load_data()

# items_df, models_df = load_data()


@app.route('/favicon.ico')
def favicon():
    return '', 204


@app.route('/')
def index():
    if items_df is not None:
        items = items_df['Item'].tolist()
    else:
        items = []
    return render_template('index.html', items=items)


@app.route('/get_models', methods=['POST'])
def get_models():
    data = request.json
    selected_item = data.get('item', '')
    print('Request data:', data)
    print('Selected item:', selected_item)
    print('models_df:', models_df)

    if selected_item and models_df is not None:
        # models = models_df[models_df['Item'] == selected_item]  # previous code without copy
        models = models_df[models_df['Item'] == selected_item].copy()  # Ensure a copy is made
        models.fillna('', inplace=True)  # Replace NaN values with an empty string
        response = models[['Model', 'Description', 'Price']].to_dict(orient='records')
        print('Response being sent to /get_models:', response)
        return jsonify(response)
    else:
        print("No response")
        return jsonify([
            {'Model': 'TestModel1', 'Description': 'Test Description 1', 'Price': 10},
            {'Model': 'TestModel2', 'Description': 'Test Description 2', 'Price': 15}
        ])

        # return jsonify([])


# @app.route('/get_book_pricing', methods=['GET'])
# def get_book_pricing():
#     if 'book pricing' in sheet_names:  # Check if the sheet exists
#         book_pricing_df = pd.read_excel('data.xlsx', sheet_name='book pricing')
#         book_pricing_df.fillna('', inplace=True)  # Handle NaN values
#         response = book_pricing_df[['binding type', 'binding cost']].to_dict(orient='records')
#         print('Book pricing response:', response)
#         return jsonify(response)
#     else:
#         return jsonify([])  # Return empty if sheet doesn't exist

@app.route('/get_book_pricing', methods=['GET'])
def get_book_pricing():
    if 'book pricing' in data:  # Check if the sheet exists
        book_pricing_df = data['book pricing']  # Access the sheet
        book_pricing_df.fillna('', inplace=True)  # Handle NaN values
        response = book_pricing_df[['binding type', 'binding cost']].to_dict(orient='records')
        print('Book pricing response:', response)
        return jsonify(response)
    else:
        return jsonify([])  # Return empty if sheet doesn't exist

# @app.route('/calculate_price', methods=['POST'])
# def calculate_price():
#     data = request.json
#     item = data.get('item', '')
#     model = data.get('model', '')
#     quantity = data.get('quantity', 1)
#     binding_type = data.get('bindingType', None)
#     num_pages = data.get('numPages', 0)
#
#     if models_df is not None:
#         # Find the selected model
#         model_row = models_df[(models_df['Item'] == item) & (models_df['Model'] == model)]
#         if not model_row.empty:
#             unit_price = float(model_row['Price'].values[0])
#             total_price = unit_price * int(quantity)
#
#             # Additional calculation for books
#             if item.lower() == 'book':
#                 binding_prices = {
#                     'Spiral Binding': 5,
#                     'Saddle Stitch': 10,
#                     'Perfect Bound': 15,
#                     'Hard Cover': 20
#                 }
#                 binding_cost = binding_prices.get(binding_type, 0)
#                 total_price += (float(num_pages) * unit_price) + binding_cost
#
#             vat = total_price * 0.15
#             total_with_vat = total_price + vat
#
#             return jsonify({
#                 'unitPrice': unit_price,
#                 'totalPrice': total_price,
#                 'vat': vat,
#                 'totalWithVat': total_with_vat
#             })
#         else:
#             return jsonify({'error': 'Model not found'}), 404
#     else:
#         return jsonify({'error': 'Data not loaded'}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4911, debug=True)
