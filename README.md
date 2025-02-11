Pricing Web App

A simple web application built to handle complex order calculations for a sales team. This app calculates item prices based on customization details and supports dynamic input fields based on user selections.
Features

* Dynamic Fields: Input fields are displayed dynamically based on the selected item (e.g., banners, boxes, books).
* Custom Calculations: Prices are calculated in real-time as input fields are updated.
* Price Handling: Fixed prices for some items, with calculations involving additional features like quantity and VAT.
* Item Models: Prices for items are fetched from an Excel database, with support for different models.
* Add and Save Items: Users can add multiple items before finalizing and save quotations as PDF files.
* Local Deployment: The app is designed to run on a local network, ensuring privacy and accessibility within the team.

Technologies Used

* Backend: Python (Flask)
* Frontend: HTML, CSS (Basic styling with focus on user experience)
* Database: Excel (Linked to models and item prices)
* PDF Generation: Used for saving and sharing quotations
* Version Control: Git, GitHub for version history and collaboration

Installation
1. Clone the Repository

Clone this repo to your local machine:

	git clone https://github.com/LoneCodeTinker/pricing_web_app.git

2. Set Up Python Environment

Make sure Python 3.x is installed on your system. You can create a virtual environment and install required dependencies:

	cd pricing_web_app
	python3 -m venv venv
	source venv/bin/activate  # For macOS/Linux
	venv\Scripts\activate  # For Windows
	pip install -r requirements.txt

3. Run the App

Start the Flask development server:

	python app.py

The app will be available at http://127.0.0.1:5000/ by default.
How It Works

Dynamic Pricing: The app pulls item data from an Excel file and displays dynamic fields based on the item type (e.g., banners, boxes). For example:
 - Banners: User inputs height and width, and the app calculates the price based on a per-unit price formula.
 - Boxes: Prices are calculated based on size (height, width, depth) and custom calculations for specific models.
 - Books: Additional fields like binding type and number of pages are dynamically shown and used to calculate the total.

Add and Save: Items can be added to the quotation table, with the ability to generate and save a PDF of the final quote.

Contributing

This project is developed as a hobby and is currently maintained by LoneCodeTinker. Feel free to contribute by submitting issues or pull requests.
