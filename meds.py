# coding=utf-8

from datetime import datetime, date
import logging, os, pickle

from flask import Flask, json, render_template
from flask_ask import Ask, request, session, question, statement, confirm_intent

app = Flask(__name__)
ask = Ask(app, "/")
logging.getLogger("flask_ask").setLevel(logging.DEBUG)
data = dict()

@ask.on_session_started
def start_session():
    print("📗\tStarting Session")
    print("session: " + str(session))
    print("request: " + str(request))
    logging.debug("Session started at {}".format(datetime.now().isoformat()))

@ask.launch
def handle_launch():
    logging.debug("Launch at {}".format(datetime.now().isoformat()))
    welcome_text = render_template('welcome')
    welcome_re_text = render_template('welcome_re')
    welcome_card_text = render_template('welcome_card')
    return question(welcome_text).reprompt(welcome_re_text).standard_card(title="Pills Here", text=welcome_card_text)

@ask.intent('PillsIntent')
def pills():
    data['points'] = data['points'] + 1
    save_data()
    print("pills")
    text = render_template('pills')
    return question(text).standard_card(title="Pills Here", text=text)

@ask.intent('GiveMedsIntent')
def give_meds():
    text = render_template('give_meds', med_count=data['med_count'])
    return question(text).standard_card(title="Your Medications", text=text)

@ask.intent('TakeMedsIntent')
def take_meds():
    print(get_dialog_state())
    print("session: " + str(session))
    print("request: " + str(request['intent']['confirmationStatus']))
    
    status = request['intent']['confirmationStatus']
    confirmed = True if status=='CONFIRMED' else False
    
    if confirmed:
        data['points'] = data['points'] + data['med_count']
        data['day_streak'] = data['day_streak'] + 1
        data['recent'] = datetime.utcnow()
        save_data()
        print("saved")
        return question(render_template('pills')).standard_card(title="Meds Taken", text=render_template('pills'))
    else:
        text = render_template('take_meds_text')
        re_text = render_template('take_meds_re')
        card_text = render_template('take_meds_card')
        print("returning")
        return confirm_intent(text).standard_card(title="Just Do It", text=card_text)

@ask.intent('RecentIntent')
def recent_meds():
    print(get_dialog_state())
    delta = datetime.utcnow() - data['recent']
    delta = days_hours_minutes(delta)
    text = render_template('recent', delta=str(delta))
    return question(text).standard_card(title="Recent meds", text=text)

def days_hours_minutes(td):
    d = td.days
    h = td.seconds//3600
    m = (td.seconds//60)%60
    t1 = ' ' if d==0 else str(d) + " days"
    t2 = ' ' if h==0 else str(h) + " hours"
    t3 = ' ' if m==0 else str(m) + " minutes"
    return (t1 + t2 + t3)
#     return td.days, td.seconds//3600, (td.seconds//60)%60

@ask.intent('UpdateIntent')
def update_meds():
    text = render_template('update_success') #add reprompt
    save_data()
    return question(text).standard_card(title="Medications Updated", text=text)

@ask.intent('RewardsIntent')
def rewards():
    text = render_template('rewards_prog', reward_delta=data['reward_delta']) 
    return question(text).standard_card(title="Rewards Status", text=text)

@ask.intent('ReportIntent')
def parent_report():
    text = render_template('report', day_streak=data['day_streak'])
    return question(text).standard_card(title="Status Reports", text=text)

@ask.intent('PointsIntent')
def points_report():
    text = render_template('points', total=data['points']) 
    return question(text).standard_card(title="Points", text=text)

@ask.intent('WhichIntent')
def which_meds():
    meds = json.dumps(data['meds'])
    text = render_template('which', meds=meds) 
    return question(text).standard_card(title="Current Meds", text=text)

@ask.session_ended
def session_ended():
    save_data()
    return statement("")

def save_data():
    with open('data.p', 'wb') as fh:
        pickle.dump(data, fh)

@app.before_request
def before_request():
    print("😑")
    logging.debug("\t🔈\t\t".format(datetime.now().isoformat()))
        
@app.before_first_request
def before_first_request():
    print("☣️")
    logging.debug("\t🥇 \t\t".format(datetime.now().isoformat()))
    
def get_dialog_state():
    return session['dialogState']


# Built-in intents http://d.pr/KKyx
@ask.intent('AMAZON.StopIntent')
def handle_stop():
    farewell_text = render_template('stop_bye')
    return statement(farewell_text)
@ask.intent('AMAZON.CancelIntent')
def handle_cancel():
    farewell_text = render_template('cancel_bye')
    return statement(farewell_text)
# @ask.intent('HelpIntent')
@ask.intent('AMAZON.HelpIntent')
def handle_help():
    help_text = render_template('help_text')
    return question(help_text)
@ask.intent('AMAZON.NoIntent')
def handle_no():
    pass
@ask.intent('AMAZON.YesIntent')
def handle_yes():
    pass
@ask.intent('AMAZON.PreviousIntent')
def handle_back():
    print("previous")
    pass
@ask.intent('AMAZON.StartOverIntent')
def start_over():
    pass

if __name__ == '__main__':
    if 'ASK_VERIFY_REQUESTS' in os.environ:
        verify = str(os.environ.get('ASK_VERIFY_REQUESTS', '')).lower()
        if verify == 'false':
            app.config['ASK_VERIFY_REQUESTS'] = False
    with open('data.p', 'rb') as fh:
        data = pickle.load(fh)
        print(str(data))
    app.run(debug=True, threaded=True)