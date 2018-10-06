#erl67
FDEBUG = True

import os, re, json, pickle
from sys import stderr
from collections import OrderedDict
from functools import wraps
from flask import Flask, g, send_from_directory, flash, render_template, abort, request, redirect, url_for, Response, session
from flask_restful import Resource, Api
from flask_debugtoolbar import DebugToolbarExtension
from random import getrandbits

transactions = OrderedDict()
categories = dict()
apiKeys = ['erl67api', 'test', 'random', 'key4']
auth = False

from flask import Flask, render_template
from flask_ask import Ask, statement

app = Flask(__name__)
ask = Ask(app, '/')

@ask.intent('HelloIntent')
def hello(firstname):
    text = render_template('hello', firstname=firstname)
    return statement(text).simple_card('Hello', text)

if __name__ == '__main__':
    print('Starting......')
    app.run(debug=True)

def eprint(*args, **kwargs):
    print(*args, file=stderr, **kwargs)
    
TAG_RE = re.compile(r'<[^>]+>')
def remove_tags(text):
    return TAG_RE.sub('', text)
