from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import User
from .form import CustomUserCreationForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required


def index(request):
    return render(request, "users/home.html")


def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():  # Added ()
            form.save()
            # return HttpResponse("Registration successful!")
            redirect("login")
    else:
        form = CustomUserCreationForm()  # Removed 'request' argument

    return render(request, "users/register.html", {"form": form})


def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(request,data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            full_name = f"{user.first_name} {user.last_name}"
            return redirect('dashboard')
    else:
        form = AuthenticationForm()
            

    return render(request, "users/login.html", {"form": form})


@login_required
def dashboard(request):
    user = request.user
    name = f"{user.first_name} {user.last_name}"
    
    if user.role == User.Role.STUDENT:
        return(HttpResponse(f"{name} is a Student..."))
    
    if user.role == User.Role.ADMIN:
        return(HttpResponse(f"{name} is an Admin..."))
    
    if user.role == User.Role.TEACHER:
        return(HttpResponse(f"{name} is a Teacher..."))
