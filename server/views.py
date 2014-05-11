import os
import json
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response
from django.core.context_processors import csrf
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from server.models import *

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
FILES_DIR = BASE_DIR  + '/media/f/'

def create_c(request):
	c = {}
	c.update(csrf(request))
	c['user'] = request.user
	return c

def main(request):
	return HttpResponseRedirect('../../../green')

def open_channel(request,channel):
	c = create_c(request)
	channel = Channel.objects.get(name=channel)
	c['channel'] = channel.name
	c['posts'] = Post.objects.filter(channel=channel).order_by('-last')[:20]
	if request.method == "POST":
		text = request.POST['text'].strip()
		try:
			if len(text) > 9950 or text == "" or len(text) < 4:
				return HttpResponseRedirect('../../../../')
		except:
			pass
		save_post(request, request.FILES['file'],text, channel)
		return render_to_response('main.html', c)
	else:
		return render_to_response('main.html', c)

def save_post(request, f, text, channel):
	extension = f.name.split('.')[-1].lower()
	if extension == f.name:
		extension = ""
	if extension.lower() not in ['jpg', 'jpeg', 'gif', 'png']:
		return False
	ip = get_ip(request)
	post = Post(date=datetime.datetime.now(),channel=channel,extension=extension,last=datetime.datetime.now(), ip=ip)
	post.save()
	r = Reply(post=post,text=text,date=datetime.datetime.now(),ip=ip)
	r.save()
	with open(FILES_DIR + str(post.id) + '.' + extension, 'wb+') as destination:
		for chunk in f.chunks():
			destination.write(chunk)
	return True

def reply(request):
	post_id = request.GET['post_id']
	last_reply_id = request.GET['last_reply_id']
	post = Post.objects.get(id=post_id)
	text = request.GET['text'].strip()
	if len(text) < 2:
		return False
	if len(text) > 9950:
		return False
	try:
		Reply.objects.get(post=post,text=text)
		return False
	except:
		pass
	ip = get_ip(request)
	r = Reply(post=post,text=text,date=datetime.datetime.now(), ip=ip)
	post.last = datetime.datetime.now()
	post.save()
	r.save()
	status = "ok"
	replies = Reply.objects.filter(post=post,id__gt=last_reply_id).order_by('id')
	replies = replies_to_html(replies)
	data = {'replies':replies, 'status':status}
	return HttpResponse(json.dumps(data), mimetype="application/json")

def get_replies(request):
	post_id = request.GET['post_id']
	post = Post.objects.get(id=post_id)
	replies = Reply.objects.filter(post=post).order_by('id')
	replies = replies_to_html(replies)
	status = "ok"
	data = {'replies':replies, 'status':status}
	return HttpResponse(json.dumps(data), mimetype="application/json")

def refresh_replies(request):
	last_reply_id = request.GET['last_reply_id']
	last_reply = Reply.objects.get(id=last_reply_id)
	replies = Reply.objects.filter(post=last_reply.post,id__gt=last_reply_id).order_by('id')
	replies = replies_to_html(replies)
	status = "ok"
	data = {'last_reply_id':last_reply_id, 'replies':replies, 'status':status}
	return HttpResponse(json.dumps(data), mimetype="application/json")

def replies_to_html(replies):
	s = ""
	for r in replies:
		s += "<div class='reply'>"
		s += "<div id='reply_text'>" + r.text + "</div>"
		s += "<div style='visibility:hidden' class='reply_id'>" + str(r.id) + "</div>"
		s += "</div>"
	return s

def help(request):
	c = create_c(request)
	return render_to_response('help.html', c)

def get_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[-1].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip