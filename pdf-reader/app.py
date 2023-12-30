from flask import Flask, render_template, request, jsonify
import PyPDF2

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/read_pdf', methods=['POST'])
def read_pdf():
    if 'pdf_file' in request.files:
        pdf_file = request.files['pdf_file']
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        num_pages = len(pdf_reader.pages)
        text_content = ''

        for num in range(0, num_pages):
            page = pdf_reader.pages[num]
            text_content += page.extract_text()

        return jsonify({'success': True, 'text_content': text_content})
    else:
        return jsonify({'success': False, 'message': 'No PDF file received'})

if __name__ == '__main__':
    app.run(debug=True)
