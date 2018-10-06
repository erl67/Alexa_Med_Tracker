# coding=utf-8

import logging, os, re
from datetime import datetime
from flask import Flask, json, render_template
from flask_ask import Ask, request, session, question, statement

app = Flask(__name__)
ask = Ask(app, "/")
logging.getLogger("flask_ask").setLevel(logging.DEBUG)

med_count = 5 
day_streak = 3
reward_delta = 8
points = 100

# Session starter

@ask.on_session_started
def start_session():
    """
    Fired at the start of the session, this is a great place to initialise state variables and the like.
    """
    print("👁️‍🗨️")
    logging.debug("👁️‍🗨️Session started at {}".format(datetime.now().isoformat()))

# Launch intent
#
# This intent is fired automatically at the point of launch.
# Use it as a way to introduce your Skill and say hello to the user. If you envisage your Skill to work using the
# one-shot paradigm (i.e. the invocation statement contains all the parameters that are required for returning the
# result

# @ask.intent('LaunchIntent')
@ask.launch
def handle_launch():
    """
    (QUESTION) Responds to the launch of the Skill with a welcome statement and a card.
    Templates:
    * Initial statement: 'welcome'
    * Reprompt statement: 'welcome_re'
    * Card title: '{{ cookiecutter.skill_name }}
    * Card body: 'welcome_card'
    """
    logging.debug("Launch at {}".format(datetime.now().isoformat()))

    welcome_text = render_template('welcome')
    welcome_re_text = render_template('welcome_re')
    welcome_card_text = render_template('welcome_card')

    return question(welcome_text).reprompt(welcome_re_text).standard_card(title="Pills Here",
                                                                          text=welcome_card_text)


# Built-in intents
# More about built-in intents: http://d.pr/KKyx
@ask.intent('AMAZON.StopIntent')
def handle_stop():
    farewell_text = render_template('stop_bye')
    return statement(farewell_text)
@ask.intent('AMAZON.CancelIntent')
def handle_cancel():
    farewell_text = render_template('cancel_bye')
    return statement(farewell_text)
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
    pass
@ask.intent('AMAZON.StartOverIntent')
def start_over():
    pass

@ask.intent('PillsIntent')
def pills():
    text = render_template('pills')
    return statement(text).standard_card(title="Pills Here", text=text)

@ask.intent('GiveMedsIntent')
def give_meds():
    text = render_template('give_meds', med_count=med_count)
    return statement(text).standard_card(title="Your Medications", text=text)

@ask.intent('TakeMedsIntent')
def take_meds():
    text = render_template('take_meds') #add reprompt
    return statement(text).standard_card(title="Did you take your meds?", text=text)

@ask.intent('UpdateIntent')
def update_meds():
    text = render_template('update_success') #add reprompt
    return statement(text).standard_card(title="Medications Updated", text=text)

@ask.intent('ProgressIntent')
def rewards():
    text = render_template('rewards_prog', reward_delta=reward_delta) #add reprompt
    return statement(text).standard_card(title="Rewards Status", text=text)

@ask.intent('ReportIntent')
def progress_report():
    text = render_template('report', day_streak=day_streak) #add reprompt
    return statement(text).standard_card(title="Status Reports", text=text)

@ask.intent('PointsIntent')
def points_report():
    text = render_template('points', total=points) #add reprompt
    return statement(text).standard_card(title="Points", text=text)


@ask.session_ended
def session_ended():
    return statement("")

@app.before_request
def before_request():
    session['requests'] = int(session.get('requests') or 0) + 1
    logging.debug("\t🔈\t\t".format(datetime.now().isoformat()))
        
@app.before_first_request
def before_first_request():
    session['starts'] = int(session.get('starts') or 0) + 1
    logging.debug("\t🥇 \t\t".format(datetime.now().isoformat()))
    

if __name__ == '__main__':
    if 'ASK_VERIFY_REQUESTS' in os.environ:
        verify = str(os.environ.get('ASK_VERIFY_REQUESTS', '')).lower()
        if verify == 'false':
            app.config['ASK_VERIFY_REQUESTS'] = False
    app.run(debug=True)
    app.run(debug=True, threaded=True)