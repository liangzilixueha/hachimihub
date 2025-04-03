from flask import Flask, render_template, send_from_directory, request
import os

app = Flask(__name__, 
    static_folder='static',
    template_folder='templates'
)

# 设置密钥
app.config['SECRET_KEY'] = 'your-secret-key-here'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/video/hjm<id>')
def videoinfo(id):
    # 当访问到形如/video/hjm{id}时，会返回videoinfo.html，同时将{id}作为参数传递给前端
    return render_template('videoinfo.html', video_id=id)

@app.route('/userinfo')
def userinfo():
    return render_template('userinfo.html')

@app.route('/edit')
def edit():
    return render_template('edit.html')

@app.route('/search')
def search():
    #这是搜索界面，可能将访问到如/search?key={key},返回search.html
    return render_template('search.html', video_id=id)

if __name__ == '__main__':
    app.run(debug=True) 