class Gamestats
{
  constructor()
  {

    this.dead = null;
    this.teamtype = null;

    this.teamkills = 0;
    this.kills = 0;
    this.deaths = 0;
    this.assists = 0;
    this.revives = 0;

    this.gold = 0;
    this.xp = 0;

    this.total_monsterskilled = 0;
    this.total_bosseskilled = 0;

    this.monsterskilled = {};
    this.bosseskilled = {};
    this.animalskilled = {};

    this.clues = 0;

    this.events = [];

  }
}

async function ReadFilesInDirAsData(filenames, dir)
{
  let data = [];
  let files = filenames;
  for (let f=0,fl=files.content.length;f<fl;f++)
  {
    let filetext = await ReadFile(dir+files.content[f]);
    let games_txt = filetext.content.split("\n");
    for (let g=0,gl=games_txt.length;g<gl;g++)
    {
      if (games_txt[g].length <= 0){continue;}
      games_txt[g] = games_txt[g].replace(/\s+/g, '');
      let game = JSON.parse(games_txt[g]);
      game.start = new Date(game.start);
      game.end = new Date(game.end);
      EnrichWithGeneralGamestats(game);
      data.push(game);
    }
  }
  return data;
}


function IsGameInGames(game_id, games)
{
  for (let g=0,gl=games.length;g<gl;g++)
  {
    if (game_id == games[g].id)
    {
      return true;
    }
  }
  false;
}


async function SaveGame(game, path)
{
  if (!path)
  {
    return {"success":false, "reason": "no path given"};
  }
  if (!game)
  {
    return {"success":false, "reason": "no game given"};
  }
  let filename = FilenameByDate(game.start)+".json";
  let filepath = path + filename;

  let attempt = await AppendFile(filepath, game);
  if(!attempt.success){return attempt};
  return attempt;
}


function EnrichWithGamelogData(gamestats, gamelog)
{
  gamestats.start = gamelog.start;
  gamestats.end = gamelog.end;
  gamestats.map = gamelog.level;
  gamestats.id = gamelog.start.getTime();
}

function EnrichWithGeneralGamestats(gamestats)
{  
    if (!gamestats.teamkills){gamestats.teamkills = 0};
    if (!gamestats.kills){gamestats.kills = 0};
    if (!gamestats.deaths){gamestats.deaths = 0};
    if (!gamestats.assists){gamestats.assists = 0};
    if (!gamestats.gold){gamestats.gold = 0};
    if (!gamestats.revives){gamestats.revives = 0};
    if (gamestats.dead){gamestats.dead = "dead"}
    let start_datum = TranslateDate(gamestats.start);
    gamestats.datum = start_datum.date;
    gamestats.start_time = start_datum.time;
    gamestats.start_ms = gamestats.start.getTime();
    gamestats.end_time = TranslateDate(gamestats.end).time;
    gamestats.players = [];

    let lowest_team_mmr, highest_team_mmr, lowest_player_mmr, highest_player_mmr;
    for (let team in gamestats.teams)
    {
      if (!lowest_team_mmr){lowest_team_mmr = team;}
      if (!highest_team_mmr){highest_team_mmr = team;}
      if (gamestats.teams[team].mmr < gamestats.teams[lowest_team_mmr].mmr){lowest_team_mmr = team;}
      else if (gamestats.teams[team].mmr > gamestats.teams[highest_team_mmr].mmr){highest_team_mmr = team;}


      for (let player in gamestats.teams[team].players)
      {
        if (!lowest_player_mmr){lowest_player_mmr = [team,player];}
        if (!highest_player_mmr){highest_player_mmr = [team,player];}
        if (gamestats.teams[team].players[player].mmr < gamestats.teams[lowest_player_mmr[0]].players[lowest_player_mmr[1]].mmr){lowest_player_mmr = [team,player];}
        else if (gamestats.teams[team].players[player].mmr > gamestats.teams[highest_player_mmr[0]].players[highest_player_mmr[1]].mmr){highest_player_mmr = [team,player];}
        gamestats.players.push(gamestats.teams[team].players[player].blood + "(" + gamestats.teams[team].players[player].profileid+")");
      }
    }
    gamestats.teams[lowest_team_mmr].lowest_mmr = true;
    gamestats.teams[highest_team_mmr].highest_mmr = true;
    gamestats.teams[lowest_player_mmr[0]].players[lowest_player_mmr[1]].lowest_mmr = true;
    gamestats.teams[highest_player_mmr[0]].players[highest_player_mmr[1]].highest_mmr = true;
}

function FilenameByDate(date)
{
  var d = TranslateDate(date);
  return (d.year +"."+d.month);
}
