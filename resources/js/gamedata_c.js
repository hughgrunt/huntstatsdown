async function GetLastGame(path_gamelog, path_attributes)
{
  //liest letzte gamestats
  //speichert falls noch nicht vorhanden & fügt es globals data hinzu
  let attempt = {};
  attempt.success = true;

  let attr_stats = await FileExists(path_attributes);
  if (!attr_stats.success){ return attr_stats;};
  let gl_stats = await FileExists(path_gamelog);
  if (!gl_stats.success){return gl_stats;};

  let gl_text = await ReadFile(path_gamelog);
  if (!gl_text.success){return gl_text;};
  let attr_text = await ReadFile(path_attributes);
  if (!attr_text.success){return attr_text;}

  let gamelog = GAMELOG.READ_LOG((gl_text.content).split("\n"));
  GLOBALS.FILEAGE.GAMELOG = gl_stats.stats.modifiedAt;
  if (!gamelog.start || !gamelog.level || !gamelog.end || !gamelog.closed_summary)
  {
    attempt.success = false;
    attempt.reason = "Could not find gamestart, gamelevel, gameend or closedsummary.";
    return attempt;
  }
  else if (gamelog.start.getTime() > gamelog.end.getTime())
  {
    attempt.success = false;
    attempt.reason = "Game starttime is bigger than endtime.";
    return attempt;
  }
  else if (gamelog.end.getTime() > gamelog.closed_summary.getTime())
  {
    attempt.success = false;
    attempt.reason = "Game endtime is bigger than closedsummarytime.";
    return attempt;
  }
  let gamestats =  XML.HarvestAttributesXMLByText(attr_text.content);
  GLOBALS.FILEAGE.ATTRIBUTES = attr_stats.stats.modifiedAt;
  EnrichWithGamelogData(gamestats, gamelog);

  if (IsGameInGames(gamestats.id, GLOBALS.DATA.ALL))
  {
    attempt.success = false;
    attempt.reason = "Game found but already exists.";
    return attempt;
  }
  let sg = await SaveGame(gamestats, GLOBALS.PATHS.DATA);
  if (!sg.success){return sg;};
  EnrichWithGeneralGamestats(gamestats);
  GLOBALS.DATA.ALL.push(gamestats);


  attempt.content = gamestats;
  return attempt;
}

async function BuildLastGame(path_gamelog, path_attributes)
{
  let last_game = await GetLastGame(path_gamelog, path_attributes);
  if (!last_game.success){return last_game.reason;}
  return CreateGamestatsTable(last_game.content, "gamestats_table", "body", GLOBALS.SETTINGS.USECUSTOMBACKGROUNDS);
}

async function DrawLastGameTo(target, path_gamelog, path_attributes)
{
  let h = await BuildLastGame(path_gamelog, path_attributes);
  document.getElementById(target).innerHTML = h;
  InitiateHistory();
}

function DrawGameTo(target, game, skip_update_history)
{
  if (!GameAlreadyDrawn(game.start_ms))
  {
    let h = CreateGamestatsTable(game, "gamestats_table", "body", GLOBALS.SETTINGS.USECUSTOMBACKGROUNDS);
    document.getElementById(target).innerHTML = h;
  }

  if (skip_update_history){return;}
  UpdateHistory();
}


function GameAlreadyDrawn(game_startms)
{
  let drawngame_startms = document.getElementById("drawngame_startms");
  if (!drawngame_startms)
  {
    return false;
  }
  if (drawngame_startms.innerHTML == game_startms)
  {
    return true;
  }
  return false;
}

async function CheckForNewGame()
{
  let attributes_path = GLOBALS.CONFIG.PATHS.attributes;
  let gamelog_path = GLOBALS.CONFIG.PATHS.gamelog;

  let age_attributes = GLOBALS.FILEAGE.ATTRIBUTES;
  let age_gamelog = GLOBALS.FILEAGE.GAMELOG;

  let attr_stats = await FileExists(attributes_path);
  let gl_stats = await FileExists(gamelog_path);

  let now_ms = new Date().getTime();
  let puffer = 10000;

  let NewAttributes = false;
  let NewGamelog = false;
  //check if any file is new game log or attributes
  if (attr_stats.success)
  {
    if (attr_stats.stats.modifiedAt > GLOBALS.FILEAGE.ATTRIBUTES && (now_ms+puffer) > attr_stats.stats.modifiedAt)
    {
      NewAttributes = true;
    }
  }
  if (!NewAttributes)
  {
    return;
  }

  if (gl_stats.success)
  {
    if (gl_stats.stats.modifiedAt > GLOBALS.FILEAGE.GAMELOG ) //&& (now_ms+puffer) > gl_stats.stats.modifiedAt ohne puffer weil sollte passen
    {
      NewGamelog = true;
    }
  }

  if (NewGamelog && NewAttributes)
  {
    GLOBALS.FILEAGE.ATTRIBUTES = attr_stats.stats.modifiedAt;
    GLOBALS.FILEAGE.GAMELOG = gl_stats.stats.modifiedAt;

    let pos_lg = await GetLastGame(GLOBALS.CONFIG.PATHS.gamelog, GLOBALS.CONFIG.PATHS.attributes);
    if (pos_lg.success)
    {
      Feedback("New game found and read.");
      DrawGameTo("gamestats", pos_lg.content);
      return;
    }
    Feedback(pos_lg.reason);
  }


}

function InitiateHistory()
{
  let reversed_data = GLOBALS.DATA.ALL.slice().reverse();
  GLOBALS.HISTORYTABLE = new TableMaker();
  document.getElementById("history").innerHTML = "";
  document.getElementById("history").appendChild(GLOBALS.HISTORYTABLE.MakeTable
    (
    {
      data:reversed_data,
      id : "gameshistory",
      columns :
      [
        {"name": "ms", "data_source": "start_ms", "inputFilterSize": 8, "fontSize":"50%", "onclick": function(cell){CopyToClipboard(cell.innerHTML);}},
        {"name": "Datum", "data_source": "datum", "inputFilterSize": 8, "onclick": function(cell){DrawGameTo("gamestats", cell.instance.data[cell.data_index], true); SelectRowFromCell(cell);}},
        {"name": "Von", "data_source": "start_time", "inputFilterSize": 4},
        {"name": "Bis", "data_source": "end_time", "inputFilterSize": 4},
        {"name": "Dead", "data_source": "dead", "inputFilterSize": 4},
        {"name": "Map", "data_source": "map", "inputFilterSize": 8},

        {"name": "Kills", "data_source": "kills", "inputFilterSize": 2, "total_type":"sum"},
        {"name": "Deaths", "data_source": "deaths", "inputFilterSize": 2, "total_type":"sum"},
        {"name": "Assissts", "data_source": "assists", "inputFilterSize": 2, "total_type":"sum"},
        {"name": "Revives", "data_source": "revives", "inputFilterSize": 2, "total_type":"sum"},
        {"name": "Gold", "data_source": "gold", "inputFilterSize": 4, "total_type":"sum"},
        {"name": "XP", "data_source": "xp", "inputFilterSize": 4, "total_type":"sum"},
        {"name": "Monsters killed", "data_source": "total_monsterskilled", "inputFilterSize": 4, "total_type":"sum"},

        {"name": "Teamkills", "data_source": "teamkills", "inputFilterSize": 2, "total_type":"sum"},
        {"name": "Bountys", "data_source": "bountys", "inputFilterSize": 4, "total_type":"sum"},
        {"name": "Teamgröße", "data_source": "teamtype", "inputFilterSize": 4},
        {"name": "Players", "data_source": "players", "fontSize":"50%", "inputFilterSize": 20},
      ],
      TR_ONCLICK: function (){DrawGameTo("gamestats", this, true);}
    }
    ));
}

function SelectRowFromCell(cell)
{
  let row = cell.parentElement;
  let trs = row.parentElement.children;
  for(let t=0,tL=trs.length;t<tL;t++)
  {
    trs[t].classList.remove("selected");
  }
  row.classList.add("selected");
}

function CopyToClipboard(txt)
{
  navigator.clipboard.writeText(txt);
  Feedback("Copied!");
}

function UpdateHistory()
{
  let reversed_data = GLOBALS.DATA.ALL.slice().reverse();
  GLOBALS.HISTORYTABLE.UpdateData(reversed_data);
}
