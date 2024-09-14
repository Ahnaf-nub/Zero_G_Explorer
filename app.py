from flask import Flask, render_template, url_for, redirect, flash, abort, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
#from flask_bcrypt import Bcrypt
import bcrypt
from flask_cors import CORS
from datetime import datetime

import os
import dotenv
import json
dotenv.load_dotenv()


db = SQLAlchemy()
app = Flask(__name__)

CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SUPABASE_DATABASE_URI')
app.config['SECRET_KEY'] = os.environ.get('SECRET_JWT')

db.init_app(app)

# Hash a password
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Verify password
def match_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    matched = match_password(plain_password, hashed_password)
    return matched



login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return Astronaut.query.get(int(user_id))

class Astronaut(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    verified = db.Column(db.Boolean, default=False)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.TEXT(160), nullable=False)
    station = db.Column(db.String(50), nullable=True)
    dateJoined = db.Column(db.Date, default = datetime.utcnow)
    userInfo = db.Column(db.JSON, nullable=True)
    special = db.Column(db.JSON, nullable=True)
    score = db.Column(db.JSON, nullable=True)



with app.app_context():
    db.session.remove()
    db.create_all()


def userExists(username):
    return Astronaut.query.filter_by(username=username).first()

def verifyUser(username, password):
    user = userExists(username)
    print("HELLO")
    print(user)
    if(user):
        return verify_password(password, user.password)
    return False

@app.route('/')
def landing():
    if(not current_user.is_anonymous):
        user = current_user
        print(user.username)
    return render_template('game.html')
"""
@app.route('/dashboard/<dashpage>', methods=['GET', 'POST'])
@login_required
def dashboard(dashpage):
    if(dashpage=="main"):
        return render_template('dashboard.html')
    elif(dashpage=="history"):
        return render_template('history.html')
    elif(dashpage=="integrate"):
        return render_template('integrate.html')
    elif(dashpage=="tune"):
        return render_template('tune.html')
    elif(dashpage=="test"):
        return render_template('test.html')
    elif(dashpage=="settings"):
        return render_template('settings.html')
    
    abort(404)

@app.route('/tutorial/<service>', methods=['GET'])
def viewTuto(service):
    if(service == 'gmail'):
        return "Gmail tuto"
    elif(service == 'yandex'):
        return "Yandex tuto"
    
    abort(404)

def getUsrTrainDat(user):
    userDat = trainData.query.filter_by(username=user.username).first()
    dat = {
        "general": userDat.generalInfo, 
        "instructions": userDat.instructions,
        "spec": userDat.specReply["specReply"], 
        "mailContacts": userDat.mailContacts, 
        "mailIntents": userDat.mailIntents
    }
    return dat

countries = json.load(
    open(os.path.join('dats','countries.json'))
)
@app.route('/getnow/<datType>', methods=['GET', 'POST'])
@app.route('/getnow/<datType>/<option>', methods=['GET', 'POST'])
def getUserDat(datType, option=0):
    if(current_user.is_anonymous):
        return {}
    
    user = current_user
    userDat = trainData.query.filter_by(username=user.username).first()
    if(datType == "user"):
        return {"name": user.userInfo["display_name"], "email":user.username}
    
    if(datType == 'userInfo'):
        return user.userInfo

    if(datType == 'countries'):
        return countries
    if(datType == 'emails'):
        mailDat = {"dates" : ["June 26", "June 27", "June 28", "June 29", "June 30", "July 1"], "num": [1, 2, 4, 0, 6, 2]}
        return mailDat
    if(datType == 'training'):
        dat = getUsrTrainDat(user)
        return dat
    if(datType == 'lastTest'):
        if("lastEmail" in userDat.special):
            return userDat.special["lastEmail"] 
    if(datType == 'servicesRmAll'):
        user.creds = {}
        db.session.commit()
        return {"status": "success"}
    if(datType == "services"):
        if("services" in user.creds):
            ucreds = {"services":[]}
            for srv in user.creds["services"]:
                ucreds["services"].append({
                    "id": srv["id"],
                    "service": srv["service"],
                    "email": srv["email"],
                    "info": srv["info"]
                })
            return ucreds;   
    return {}


@login_required
@app.route('/userAct', methods=['GET', 'POST'])
@app.route('/userAct/<datatype>', methods=['GET', 'POST'])
async def fromClient(datatype="none"):
    user = current_user
    userDat = trainData.query.filter_by(username=user.username).first()

    data = request.get_json()
    if(datatype == "trainData"):
        userDat.generalInfo = data['general']
        userDat.instructions = data['instructions']
        userDat.specReply = data['specReply']
        userDat.mailContacts = data['mailContacts']
        userDat.mailIntents = data['mailIntents']
        db.session.commit()
        return {'message': 'Data received!'}
    
    if(datatype == "testEmail"):
        repooly = await mailing.generateReply(getUsrTrainDat(user), data['subject'], data['body'])
        if(repooly.startswith("<NO>")):
            return {'message': 'no', 'reply': ''}
        
        _reply = {'message': 'success', 'reply': repooly}
        spec = userDat.special.copy()
        spec["lastEmail"] = {
            "subIn": data['subject'],
            "bodyIn": data['body'],
            "reply": repooly
        }
        userDat.special = spec
        db.session.commit()
        return _reply
    
    if(datatype == "userInfo"):
        user.userInfo = data
        db.session.commit()
        return {'status': 'success'}

    if(datatype == "newService"):
        ucreds = user.creds.copy()
        if(not "services" in ucreds):
            ucreds["services"] = []
        data['id'] = f"{datetime.now().strftime('%Y%m%d%H%M%S')}"
        data['toggle'] = False
        data['info'] = {}
        inf = data['info']
        inf['status'] = {"label":"Verifying", "reference":"..."}
        inf['emailCount'] = 0
        inf['lastCheck'] = datetime.now().strftime('%d-%m-%Y %H:%M')
        ucreds["services"].append(data)

        user.creds = ucreds
        db.session.commit()
        return {'status': 'success'}

    return {'message': 'Failed'}
"""
"""
@app.route('/login', methods=['GET', 'POST'])
def login():
    if(not current_user.is_anonymous):
        return redirect(url_for('dashboard', dashpage='main'))

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for('dashboard', dashpage='main'))
            else:
                flash("Wrong password!")
        else:
            flash("Couldn't find an account with that email.")
    return render_template('login.html', form = form)

@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('landing'))
"""
"""@app.route('/register', methods=['GET', 'POST'])
def register():
    if(not current_user.is_anonymous):
        return redirect(url_for('dashboard', dashpage = 'main'))
    
    form = RegisterForm()
    if form.validate_on_submit():
        if(form.password.data != form.confPass.data):
            flash("Passwords do not match!")
            return redirect(url_for('register'))
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = User(
            username=form.username.data, password=hashed_password,
            creds = {}, special = {}, 
            userInfo = {
                "first_name": "", "last_name": "", "display_name": form.name.data, "company": "", "address" : "", "phone": "", "country": ""
            }
        )
        
        
        _username, _generalInfo, _instructions, _specReply, _mailTemplates, _mailContacts, _mailIntents, _mailHistory =  userManager.createUserDat(new_user)
        user_data = trainData(
            username=_username, generalInfo=_generalInfo, instructions= _instructions, 
            specReply=_specReply, mailTemplates=_mailTemplates, 
            mailContacts=_mailContacts, mailIntents=_mailIntents, mailHistory=_mailHistory,
            special = {}
        )
        db.session.add_all([new_user, user_data])
        db.session.commit()
        login_user(new_user)
        return redirect(url_for('login'))
    
    return render_template('register.html', form = form)
"""

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.form
        username = data['username']
        password = data['password']

        if(verifyUser(username, password)):
            user = userExists(username)
            login_user(user)
            return redirect(url_for('landing'))
        return render_template('login.html', message="Invalid credentials")
    else:
        return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.form
        username = data['username']
        password = data['password']
        hash_p = str(hash_password(password))
        station = data['space_station']
        if(len(password) < 8):
            return render_template('register.html', message="Password must be at least 8 characters long")
        if(userExists(username)):
            return render_template('register.html', message="User already exists")
        print(hash_p)
        new_user = Astronaut(username=username, password=hash_p, station=station)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))
    else:
        return render_template('register.html')

@app.errorhandler(404)
def not_found(e): 
  return "Page not found!"

if __name__ == "__main__":
    app.run(debug=True)