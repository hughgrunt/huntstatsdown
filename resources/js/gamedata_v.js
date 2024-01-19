function CreateGamestatsTable(gamestats, table_id, background_target, usecustombackgrounds)
{

  let hiddengame_startms = "<div id='drawngame_startms' style='display:none'>"+gamestats.start_ms+"</div>";
  if (!table_id){table_id = "gamestats_table"}
  let g = gamestats;
  let tr_classes = ["tr_even", "tr_uneven", "tr_team", "tr_own_team", "tr_timeline"];
  let tr_colors = ["grey", "lightgrey"];
  let tr_gap = 40;

  let map_folder_name = "lawsondelta";
  switch(g.map)
  {
    case "DeSalle": map_folder_name = "desalle";break;
    case "StillwaterBayou": map_folder_name = "stillwaterbayou";break;
    default: break;
  }
  let background_url = SelectRandomImage(map_folder_name);
  if(usecustombackgrounds){background_url = SelectRandomImage("backgrounds");}
  if (background_target)
  {
    SetBackgroundImageOfElement(document.getElementById(background_target), background_url);
  }


  let t = "<table id='"+table_id+"' >";
  let rt, rp, re;
  let tr_team_empty_td = "";

  t += "<tr>"
  t += "<td colspan='1000' style='text-align:center'>"
  t += TranslateDate(g.start).date + ": " + TranslateDate(g.start).time + " - " + TranslateDate(g.end).time + ", " + g.map;
  t += "</td>"
  t += "</tr>"

  let div_cards = "<div class='card_container_holder'>";

  let div_card_container_general = "<div class='card_container'>";

  let teamtype = "solo";
  switch(g.teamtype)
  {
    case 2: teamtype = "duo";break;
    case 3: teamtype = "trio";break;
    default: break;
  }

  if (g.dead){div_card_container_general+= BuildCard("dead_"+teamtype,"","you did not survive");}
  else if (g.teamextraction)
  {
    if (g.bountys)
    {
      div_card_container_general+= BuildCard("bountysextracted_"+teamtype,g.bountys,"bountys extracted");
    }
    else
    {
      div_card_container_general+= BuildCard("extraction_"+teamtype,"","you made it");
    }
  }



  if (g.teamkills && teamtype != "solo")
  {
      div_card_container_general+= BuildCard("teamkills_"+teamtype,g.teamkills,"teamkills");

  }

  if (g.kills){div_card_container_general+= BuildCard("kills",g.kills,"kills");}
  if (g.deaths){div_card_container_general+= BuildCard("deaths",g.deaths,"deaths");}
  if (g.assists){div_card_container_general+= BuildCard("assists",g.assists,"assists");}
  if (g.revives){div_card_container_general+= BuildCard("revives",g.revives,"revives");}




  if (g.gold){div_card_container_general+= BuildCard("gold",g.gold,"money made");}
  if (g.clues){div_card_container_general+= BuildCard("clues",g.clues,"clues found");}


  div_card_container_general+= BuildBossCards(g.bosseskilled, g.bossesbanished, g.bossesextracted);





  if (g.total_monsterskilled)
  {
    div_card_container_general += BuildCard("monster",g.total_monsterskilled,"monster killed");
  }

  for (let prop in g.monsterskilled)
  {
    div_card_container_general += BuildCard(prop,g.monsterskilled[prop],prop +" killed");
  }

  for (let prop in g.animalskilled)
  {
    div_card_container_general += BuildCard(prop,g.animalskilled[prop],prop +" killed");
  }

  div_card_container_general += "</div>";

  div_cards += div_card_container_general;

  div_cards += "</div>";
  t += "<tr>"
  t += "<td colspan='1000'>";
  t += div_cards;
  t += "</td>";
  t += "</tr>";

  //timeline, denk an die reihe davor, also hier ist es 2 leere davor, je nachdem wieviel info bei teams und players
  t += "<tr class='"+tr_classes[4]+"'>"
  t += "<td width='300px;'></td> <td width='100px;'></td> <td width='100px;'></td>";
  t += "<td style='width:"+tr_gap+"px'> </td>"; //gap bf timeline
  for (let event in g.events)
  {
    t += "<td>"+g.events[event].timestamp+"</td>";
    tr_team_empty_td += "<td></td>";
  }
  t += "</tr>"

  for(let team in g.teams)
  {
    let tr_class_team = tr_classes[2];
    let t_badge = "";
    if (g.teams[team].lowest_mmr){t_badge = "<span title='lowest mmr team'>&#8595;&#8595;</span>";}
    else if (g.teams[team].highest_mmr){t_badge = "<span title='highest mmr team'>&#8593;&#8593;</span>";}
    if (g.teams[team].ownteam){tr_class_team = tr_classes[3]}
    t += "<tr class='"+tr_class_team+"'>";
    t += "<th>Team "+ team + t_badge+"</th>";

    let t_mmr = GetMMRInfo(g.teams[team].mmr);
    t += "<th class='mmr_value' onmouseenter='SetVisibilityOfClass("+'"'+"mmr_next"+'"'+", "+'"'+"visible"+'"'+")' onmouseleave='SetVisibilityOfClass("+'"'+"mmr_next"+'"'+", "+'"'+"hidden"+'"'+")'>"+ g.teams[team].mmr + BuildMMRNext(t_mmr.next) +"</th>";
    t += "<th>"+BuildMMRStars(t_mmr.stars) + "</th>";
    t += "<td style='width:"+tr_gap+"px'> </td>"; //gap bf timeline
    t += tr_team_empty_td
    t += "</tr>";

    let tr_player_uneven = true;
    for (let player in g.teams[team].players)
    {
      let tr_class = tr_classes[1];
      if (!tr_player_uneven) tr_class = tr_classes[0];
      t += "<tr class='"+tr_class+" hoverable'>"
      let p_badge = "";
      if (g.teams[team].players[player].lowest_mmr){p_badge = "<span title='lowest mmr player'>&#8595;&#8595;</span>"}
      else if (g.teams[team].players[player].highest_mmr){p_badge = "<span title='highest mmr player'>&#8593;&#8593;</span>";}
      t += "<td>"+ g.teams[team].players[player].blood +p_badge+"</td>"
      let p_mmr = GetMMRInfo(g.teams[team].players[player].mmr);
      t += "<td class='mmr_value' onmouseenter='SetVisibilityOfClass("+'"'+"mmr_next"+'"'+", "+'"'+"visible"+'"'+")' onmouseleave='SetVisibilityOfClass("+'"'+"mmr_next"+'"'+", "+'"'+"hidden"+'"'+")'>"+ g.teams[team].players[player].mmr + BuildMMRNext(p_mmr.next) +"</td>"


      t += "<td>"+BuildMMRStars(p_mmr.stars) + "</td>";
      t += "<td style='width:"+tr_gap+"px'> </td>"; //gap bf timeline

      for (let pevent in g.events)
      {
        if (g.events[pevent].profileid == g.teams[team].players[player].profileid)
        {
          t += "<td>"+TranslateEvent(g.events[pevent].what)+"</td>";
        }
        else
        {
          t += "<td></td>";
        }
      }
      t += "</tr>"
      if (tr_player_uneven){tr_player_uneven = false;}
      else {tr_player_uneven = true;}
    }
  }
  t += "</table>";
  return hiddengame_startms + " " + t;
}

function BuildDead(ded)
{
  if (ded)
  {
    return "you died"
  }
  else
  {
      return "you survived"
  }
}

function SetBackgroundImageOfElement(e, img_url)
{
  if (e)
  {
    e.style.backgroundImage = "linear-gradient(rgba(14, 14,14, "+GLOBALS.SETTINGS.BACKGROUNDIMAGEBRIGHTNESS+"), rgba(14, 14, 14, "+GLOBALS.SETTINGS.BACKGROUNDIMAGEBRIGHTNESS+")),url('"+img_url+"')";
    e.style.backgroundRepeat = "no-repeat";
    e.style.backgroundSize = "cover";
    e.style.backgroundPosition = "center";
    document.getElementById("brightness_slider").value = (GLOBALS.SETTINGS.BACKGROUNDIMAGEBRIGHTNESS * 100);
  }
}

function ChangeBackgroundRGBAOfElement(e, value)
{
  if (e)
  {
    let opacity = (value /100).toFixed(1) || 0.1;
    if (opacity <= 0.1){opacity = 0.1}
    else if (opacity >= 0.9){opacity = 0.9;}
    GLOBALS.SETTINGS.BACKGROUNDIMAGEBRIGHTNESS = opacity;
    let current = e.style.backgroundImage;
    let update = current.replace(/(\d\.\d)/g, opacity);
    e.style.backgroundImage = update;
  }
}
