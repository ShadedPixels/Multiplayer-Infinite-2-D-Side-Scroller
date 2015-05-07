﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Infinite_Sidescroller.Models;

namespace Infinite_Sidescroller.Controllers
{
  public class HomeController : Controller
  {
    GameDB GameDB = new GameDB();

    // GET: Homepage
    public ActionResult Index()
    {
      return View();
    }

    // GET: /Bestiary
    public ActionResult Bestiary()
    {
      return View();
    }

    // GET: /Lobby
    [Authorize]
    public ActionResult Lobby()
    {
      return View();
    }

    // GET: /Leaderboard
    public ActionResult Leaderboard()
    {
      List<Leaderboard> Multiplayer = GameDB.Leaderboard.OrderByDescending(entry => entry.Score).Take(10).Where(entry => entry.GameType == true).ToList();
      List<Leaderboard> Singleplayer = GameDB.Leaderboard.OrderByDescending(entry => entry.Score).Take(10).Where(entry => entry.GameType == false).ToList();
      LeaderboardViewModel model = new LeaderboardViewModel();
      model.SinglePlayer = Singleplayer;
      model.Multiplayer = Multiplayer;

      return View(model);
    }

    // GET: /Developers
    public ActionResult Developers()
    {
        return View();
    }
  }
}