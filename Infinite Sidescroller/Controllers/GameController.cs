﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Infinite_Sidescroller.Models;
using System.Web.Script.Serialization;

namespace Infinite_Sidescroller.Controllers
{
  public class GameController : Controller
  {
    GameDB GameDB = new GameDB();

    // GET: Game
    public ActionResult Index(string UserID, bool isMultiplayer, string OtherPlayers, int? sessionID)
    {
      GameSessions game;
      if (isMultiplayer)
      {
        game = GameDB.GameSession.Where(entry => entry.Id == sessionID).ToList()[0];
        game.IsStarted = true;
        GameDB.Entry(game).State = System.Data.Entity.EntityState.Modified;
        GameDB.SaveChanges();
      }
      else
      {
        game = new GameSessions();
        game.HostUsername = UserID;
        if (!String.IsNullOrEmpty(OtherPlayers))
        {
          game.PlayerNames = OtherPlayers;
        }
        else
        {
          game.PlayerNames = UserID;
        }
        game.IsStarted = true;
        GameDB.GameSession.Add(game);

        GameDB.Entry(game).State = System.Data.Entity.EntityState.Added;
        GameDB.SaveChanges();
      }

      return View(game);
    }

    [AjaxOnly]
    public ActionResult SaveScore(int sessionid, int score)
    {
      List<GameSessions> ScoreEntry = GameDB.GameSession.Where(entry => entry.Id == sessionid).ToList();
      ScoreEntry[0].Score = score;
      ScoreEntry[0].IsCompleted = true;
      GameDB.Entry(ScoreEntry[0]).State = System.Data.Entity.EntityState.Modified;
      GameDB.SaveChanges();

      if (HttpContext.Request.IsAjaxRequest())
      {
        var serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = Int32.MaxValue;
        var result = new ContentResult
        {
          Content = serializer.Serialize(ScoreEntry),
          ContentType = "application/json"
        };

        return (result);
      }

      return View(); // this line will never execute
    }
  }
}