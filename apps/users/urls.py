from django.urls import path
from . import views

urlpatterns = [
    path("", view=views.index, name="home"),
    path("register/", view=views.register_view, name="register"),
    path("login/", view=views.login_view, name="login"),
    path("dashboard/", view=views.dashboard, name="dashboard"),
    path("api/home/", views.home_api_view, name="api_home"),
]
