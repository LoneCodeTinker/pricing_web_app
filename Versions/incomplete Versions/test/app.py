from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    item = data['item']
    fields = data['fields']

    # Placeholder logic for pricing calculation
    price = 0
    if item == 'banner':
        height = float(fields['height'])
        width = float(fields['width'])
        price = ((height * width)/10000) * 50  # Example calculation
    elif item == 'box':
        height = float(fields['height'])
        width = float(fields['width'])
        depth = float(fields['depth'])
        price = height * width * depth * 5
    elif item == 'book':
        height = float(fields['height'])
        width = float(fields['width'])
        pages = int(fields['pages'])
        price = height * width * pages * 2

    return jsonify({'price': price})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4910, debug=True)
