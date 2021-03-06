﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Infinite_Sidescroller
{
  public class RouteConfig
  {
    public static void RegisterRoutes(RouteCollection routes)
    {
      routes.LowercaseUrls = true;
      routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

      routes.MapRoute(
        name: "GameController",
        url: "game/{action}",
        defaults: new { controller = "Game", action = "Index" }
      );

      routes.MapRoute(
        name: "HomeController",
        url: "{action}",
        defaults: new { controller = "Home" }
      );

      routes.MapRoute(
        name: "Basepage",
        url: "",
        defaults: new { controller = "Home", action = "Index" }
        );

      routes.MapRoute(
        name: "Default",
        url: "{controller}/{action}/{id}",
        defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
      );
    }
  }
}