const XML =
{
  ParseTextToXML : function (text)
  {
    let parser = new DOMParser();
    let obj = parser.parseFromString(text, "text/xml");
    return obj;
  },
  GetValueByName : function (nodes, name)
  {
    let nd = nodes;
    for (let n = 0;n<nd.length;n++)
    {
      if (nd[n].getAttribute("name") == name)
      {
        return nd[n].getAttribute("value");
      }
    }
    return false;
  },
  GetValuesByNamesWithPreText: function (nodes, names, pre, ignore_zerofalse) //nodes, array, string
  {
    let nd = nodes;
    let obj = {};
    for(let n = 0;n<nd.length;n++)
    {
      for (let nm = 0;nm<names.length;nm++)
      {
        if (nd[n].getAttribute("name") == pre + names[nm])
        {
          let v = nd[n].getAttribute("value");
          if (ignore_zerofalse && (v == "0" || v == "false" || v.length <= 0))
          {continue;}
          obj[names[nm]] = nd[n].getAttribute("value");
          continue;
        }
      }
    }
    return obj;
  },
  GetMissionEntryAttrByNameWithRequiredValue : function (nodes, pre_name, name, required_value, max, searched_name)
  {
    //gets the number of the searched mission bag and then returns the searched attr of this numbered bag
    let nd = nodes;
    for (let n = 0;n<nd.length;n++)
    {
      let nm = nd[n].getAttribute("name");
      let attr_value = nd[n].getAttribute("value")
      if (nm.startsWith(pre_name) && nm.endsWith(name) && attr_value == required_value)
      {
        let s = nm.split("_");
        let num = parseInt(s[1], 10);
        if (parseInt(s[1], 10) <= max)
        {
          return this.GetValueByName(nodes, pre_name+"_"+num+"_"+searched_name);
        }
      }
    }
    return false;
  },
  GetMissionEntrysSumByName : function (nodes, pre_name, searched_name, max)
  {
    let nd = nodes;
    let sum = 0;
    for (let n = 0;n<nd.length;n++)
    {
      let nm = nd[n].getAttribute("name");
      let attr_value = nd[n].getAttribute("value");
      let s = nm.split("_");
      let num = parseInt(s[1], 10);
      if (nm.startsWith(pre_name) && nm.endsWith(name) && num <= max)
      {
        sum += parseInt(this.GetValueByName(nodes, pre_name+"_"+num+"_"+searched_name), 10);
      }
    }
    return sum;
  },
  GetMissionEntryNumber : function (mission_entry)
  {
    let split = mission_entry.split("_");
    return parseInt(split[1], 10);
  },
  ParseMissionEntry: function (entry_name, entry_value)
  {
    let split = entry_name.split("_");
    let name = split[0];
    let entry = {};
    if (name.startsWith("MissionAccoladeEntry") || name.startsWith("MissionBagEntry") || name.startsWith("MissionBagTeam"))
    {
      entry.number = parseInt(split[1], 10) || 0;
      entry.prop = "self";
      if(split.length > 2){entry.prop = split[2];}
      entry.value = entry_value;
    }
    else if (name.startsWith("MissionBagPlayer"))
    {
      entry.number = parseInt(split[2], 10) || 0;
      entry.team = parseInt(split[1], 10) || 0;
      entry.prop = split[3];
      if (split.length > 4 &&split[4] == "downedbyteammate"){entry.prop = split[3] + split[4];};
      //if (split[4]){entry.prop+=split[4];};
      entry.value = entry_value;
    }
    return entry;
  },
  FarmMissionEntry: function(items, max_items, farm_requests, type)
  {
    let stats = {};
    for (let i=0;i<max_items;i++)
    {
      let generals = [];
      if (type == "accolade")
      {
        generals =
        [
          {"propname":"gold", "target_prop": "gold_found"},
          {"propname":"bounty", "target_prop": "gold_bounty"},
          {"propname":"xp", "target_prop": "xp"}
        ];
        for (let g=0,gL=generals.length;g<gL;g++)
        {
          if(items[i][generals[g].propname])
          {
            if(!stats[generals[g].target_prop]){stats[generals[g].target_prop] = 0;}
            stats[generals[g].target_prop] += parseInt(items[i][generals[g].propname], 10);
          }
        }
      }

      let delete_requests = [];
      for (let r=0,rL=farm_requests.length;r<rL;r++)
      {
        if(items[i][farm_requests[r].source_prop] && items[i][farm_requests[r].source_prop] == farm_requests[r].marker)
        {
          let vl = null;
          if (farm_requests[r].override_value){vl = farm_requests[r].override_value;}
          else if (farm_requests[r].value_type == "int"){vl = parseInt(items[i][farm_requests[r].source_value], 10)||0;}
          else {vl = items[i][farm_requests[r].source_value];}
          if (farm_requests[r].target_prop2)
          {
            if (!stats[farm_requests[r].target_prop])
            {stats[farm_requests[r].target_prop] = {};}
            stats[farm_requests[r].target_prop][farm_requests[r].target_prop2] = vl;
          }
          else
          {
            stats[farm_requests[r].target_prop] = vl;

          }
          delete_requests.push(r);
        }
      }
      let del_correction = 0;
      for (let dl=0,dlL=delete_requests.length;dl<dlL;dl++)
      {
        farm_requests.splice(delete_requests[dl] + del_correction, 1);
        del_correction--;
      }
    }
    return stats;
  },
  FarmTeams : function (teams, max_teams)
  {
    let pTeams = {}, events = [], teamtype = 0;
    //pro team die anzahl der spieler holen
    for (let team in teams)
    {
      if (team > max_teams){continue;}
      let max_players = parseInt(teams[team].numplayers, 10);
      teams[team].isinvite = JSON.parse(teams[team].isinvite);
      for (let prop in teams[team])
      {
        if (!pTeams[team]){pTeams[team] = {};}
        if (prop == "players")
        {
          if (!pTeams[team][prop]){pTeams[team][prop] = {};};
          for (let player in teams[team][prop])
          {
            if (player < max_players)
            {
              let needed_values =
              [
                {"marker":"blood", "v_type":"str"},
                {"marker":"mmr", "v_type":"int"},
                {"marker":"profileid", "v_type":"str"},
                {"marker":"skillbased", "v_type":"bool"},
                {"marker":"ispartner", "v_type":"bool"},
                {"marker":"bountyextracted", "v_type":"str"},
                {"marker":"bountypickedup", "v_type":"str"},
                {"marker":"downedbyme", "v_type":"str"},
                {"marker":"killedbyme", "v_type":"str"},
                {"marker":"downedme", "v_type":"str"},
                {"marker":"killedme", "v_type":"str"},
                {"marker":"downedbyteammate", "v_type":"str"},
                {"marker":"killedbyteammate", "v_type":"str"},
                {"marker":"downedteammate", "v_type":"str"},
                {"marker":"killedteammate", "v_type":"str"},
                {"marker":"teamextraction", "v_type":"bool"},
                {"marker":"hadWellSpring", "v_type":"bool"},
                {"marker":"issoulsurvivor", "v_type":"bool"},
                {"marker":"proximitytome", "v_type":"bool"},
                {"marker":"proximitytoteammate", "v_type":"bool"}
              ];
              for (let v=0,vL=needed_values.length;v<vL;v++)
              {
                if (!pTeams[team][prop][player]){pTeams[team][prop][player] = {};};
                if (teams[team][prop][player][needed_values[v].marker])
                {
                  let vl = teams[team][prop][player][needed_values[v].marker];
                  if (vl == "0" || vl == "false"){continue;}
                  if (needed_values[v].v_type == "int"){vl = parseInt(teams[team][prop][player][needed_values[v].marker],10);}
                  else if (needed_values[v].v_type == "bool"){vl = JSON.parse(teams[team][prop][player][needed_values[v].marker]);}
                  pTeams[team][prop][player][needed_values[v].marker] = vl;
                }
              }
              let needed_events =
              [
                "tooltipdownedbyme", "tooltipkilledbyme",  "tooltipdownedme", "tooltipkilledme",
                "tooltipdownedbyteammate", "tooltipkilledbyteammate", "tooltipdownedteammate", "tooltipkilledteammate",
                "tooltipbountypickedup", "tooltipbountyextracted"
              ];
              for(let n=0,nL=needed_events.length;n<nL;n++)
              {

                if (teams[team][prop][player][needed_events[n]] && teams[team][prop][player][needed_events[n]] != "0")
                {
                  let event_name = needed_events[n].replaceAll("tooltip", "");
                  event_name = event_name.replaceAll("_", "");
                  let se = teams[team][prop][player][needed_events[n]];
                  se = se.replaceAll("~", "");
                  se = se.split("@");

                  for(let s=0,sL=se.length;s<sL;s++)
                  {
                    if(se[s].indexOf(":")>-1)
                    {
                      let time_of_event = se[s].split(" ")[1];
                      let m_s = time_of_event.split(":");
                      let minutes = parseInt(m_s[0], 10);
                      let seconds = parseInt(m_s[1], 10);

                      let player_event = {};
                      player_event.what = event_name;
                      player_event.time_in_seconds = (minutes * 60) + seconds;
                      player_event.timestamp = (minutes <10?"0":"") +minutes + ":"+(seconds <10?"0":"")+seconds;
                      player_event.profileid = teams[team][prop][player].profileid;
                      events.push(player_event);
                    }
                  }
                }
              }

            }
          }
          continue;
        }
      }

      let needed_values =
      [
        {"marker":"handicap", "v_type":"int"},
        {"marker":"isinvite", "v_type":"bool"},
        {"marker":"mmr", "v_type":"int"},
        {"marker":"numplayers", "v_type":"int"},
        {"marker":"ownteam", "v_type":"bool"},
      ];
      for (let n=0,nL=needed_values.length;n<nL;n++)
      {
        if (teams[team][needed_values[n].marker])
        {
          let vl = teams[team][needed_values[n].marker];
          if (vl == "0" || vl == "false"){continue;}
          if (needed_values[n].v_type == "int"){vl = parseInt(vl,10);}
          else if (needed_values[n].v_type == "bool"){vl = JSON.parse(vl);}
          pTeams[team][needed_values[n].marker] = vl;
        }
      }
      if (pTeams[team].ownteam){teamtype = pTeams[team].numplayers;}
    }
    return {"teams":pTeams, "events":events, "teamtype": teamtype};
  },
  FarmEvents : function(events)
  {
    let b = {};
    b.kills = 0;
    b.deaths = 0;
    b.teamkills = 0;
    for (let e=0,eL=events.length;e<eL;e++)
    {
      if(events[e].what == "downedbyme" || events[e].what == "killedbyme")
      {
        b.kills++;
        b.teamkills++;
      }
      else if(events[e].what == "downedbyteammate" || events[e].what == "killedbyteammate")
      {
        b.teamkills++;
      }
      else if(events[e].what == "downedme" || events[e].what == "killedme")
      {
        b.deaths++;
      }
    }
    return b;
  },
  TranslateTooltip : function(tooltipObj)
  {

    tooltip = tooltip.replace("tooltip", "");
    tooltip = tooltip.replace("_", "");
    return tooltip;
  },
  SortByTimeInSeconds: function (a,b)
  {
    if ( a.time_in_seconds < b.time_in_seconds ){
      return -1;
    }
    if ( a.time_in_seconds > b.time_in_seconds ){
      return 1;
    }
    return 0;
  },
  CleanEventsOfDoubles: function (events)
  {
    let del_indices = [];
    let ev_length = events.length;
    for (let clear_event =0; clear_event<ev_length;clear_event++)
    {
      let c_event = events[clear_event]; //current_event
      if (c_event.what.indexOf("killed") > -1)
      {
        let possible_double_marker = c_event.what.replace("killed", "downed");
        let profileid = c_event.profileid
        let time_in_seconds = c_event.time_in_seconds;

        for (let loop_till_now = 0; loop_till_now < clear_event; loop_till_now++)
        {
          let possible_double_event = events[loop_till_now];
          if (c_event.time_in_seconds == possible_double_event.time_in_seconds && c_event.pid == possible_double_event.pid && possible_double_event.what == possible_double_marker)
          {del_indices.push(clear_event);}
        }
      }
      if (c_event.what.indexOf("bountyextracted") > -1)
      {
        let possible_double_marker = "bountypickedup";
        let profileid = c_event.profileid
        let time_in_seconds = c_event.time_in_seconds;
        for (let double_loop = 0; double_loop < ev_length; double_loop++)
        {
          let possible_double_event = events[double_loop];
          if (c_event.time_in_seconds == possible_double_event.time_in_seconds && c_event.pid == possible_double_event.pid && possible_double_event.what == possible_double_marker)
          {
            del_indices.push(clear_event);
          }
        }
      }
    }
    let del_correction = 0;
    for (let del = 0,dil = del_indices.length; del< dil;del++)
    {
      events.splice((del_indices[del] + del_correction), 1);
      del_correction--;
    }
    return events;
  },
  CleanObject: function (obj)
  {
    let rObj = obj;
    for (var prop in rObj)
    {
      for (var prop2 in rObj[prop])
        {
          if (!rObj[prop][prop2])
          {
            delete rObj[prop][prop2];
          }
        }
      if (!rObj[prop])
      {
        delete rObj[prop];
      }
    }
    return rObj;
  },
  HarvestAttributesXMLByText : function (attributes_text)
  {
    let gs = new Gamestats();
    let parsed = this.ParseTextToXML(attributes_text);
    let attr = parsed.getElementsByTagName("Attr");

    let missionbags = {}, missionaccolades = {}, missionteams = {};
    let max_bags = 0, max_accolades = 0, max_teams = 0;

    //first loop through all 4k entries
    let request_list =
    [
      {"request_type":"max_bags", "marker" : "MissionBagNumEntries"},
      {"request_type":"max_accolades", "marker" : "MissionBagNumAccolades"},
      {"request_type":"max_teams", "marker" : "MissionBagNumTeams"},
      {"request_type":"gamestats", "value_type": "int", "marker" : "PCLevelLoadingTimeMissionUnload", "target": "loading_time"},
      {"request_type":"gamestats", "value_type": "bool", "marker" : "MissionBagIsHunterDead", "target": "dead"},
      {"request_type":"gamestats", "value_type": "int", "marker" : "MissionBagFbeGoldBonus", "target": "gold_fbe"},
      {"request_type":"gamestats", "value_type": "int", "marker" : "MissionBagFbeHunterXpBonus", "target": "xp"},
      {"request_type":"missionaccolade", "marker" : "MissionAccoladeEntry_"},
      {"request_type":"missionbag", "marker" : "MissionBagEntry_"},
      {"request_type":"team", "marker" : "MissionBagTeam_"},
      {"request_type":"player", "marker" : "MissionBagPlayer_"}
    ];
    for(let a=0,aL=attr.length;a<aL;a++)
    {
      let line = attr[a];
      let attr_name = line.getAttribute("name");
      let attr_value = line.getAttribute("value");
      let delete_requests = [];

      for (let r=0,rL=request_list.length;r<rL;r++)
      {
        if (attr_name.includes(request_list[r].marker))
        {
          switch(request_list[r].request_type)
          {
            case "max_bags":
              max_bags = parseInt(attr_value, 10) || 0;
              delete_requests.push(r);
              break;
            case "max_accolades":
              max_accolades = parseInt(attr_value, 10) || 0;
              delete_requests.push(r);
              break;
            case "max_teams":
              max_teams = parseInt(attr_value, 10) || 0;
              delete_requests.push(r);
              break;
            case "gamestats":
              let value = attr_value;
              if (request_list[r].value_type == "int")
              {
                value = parseInt(value, 10) ||0;
                if (gs[request_list[r].target])
                {
                  value += parseInt(gs[request_list[r].target], 10);
                }
              }
              else if (request_list[r].value_type == "bool")
              {
                value = JSON.parse(value);
              }
              gs[request_list[r].target] = value;
              delete_requests.push(r);
              break;
            case "missionbag":
              let mb = this.ParseMissionEntry(attr_name, attr_value);
              if (max_bags){if (mb.number > max_bags) {break;}}
              if (!missionbags[mb.number]){missionbags[mb.number] = {};};
              missionbags[mb.number][mb.prop] = mb.value;
              break;
            case "missionaccolade":
              let ma = this.ParseMissionEntry(attr_name, attr_value);
              if (max_accolades){if (ma.number > max_accolades) {break;}}
              if (!missionaccolades[ma.number]){missionaccolades[ma.number] = {};};
              missionaccolades[ma.number][ma.prop] = ma.value;
              break;
            case "team":
              let mt = this.ParseMissionEntry(attr_name, attr_value);
              if (max_teams){if (mt.number >= max_teams) {break;}}
              if (!missionteams[mt.number]){missionteams[mt.number] = {};};
              missionteams[mt.number][mt.prop] = mt.value;
              break;
            case "player":
              let mp = this.ParseMissionEntry(attr_name, attr_value);
              if(max_teams){if (mp.team >= max_teams){break;}}
              if (!missionteams[mp.team]){missionteams[mp.team] = {}};
              if (!missionteams[mp.team].players){missionteams[mp.team].players = {}};
              if (!missionteams[mp.team].players[mp.number]){missionteams[mp.team].players[mp.number] = {}};
              missionteams[mp.team].players[mp.number][mp.prop] = mp.value;
              break;
            default:
              break;
          }
        }
      }

      let del_cor = 0;
      for (let d=0,dL=delete_requests.length;d<dL;d++)
      {request_list.splice(delete_requests[d]+del_cor, 1);del_cor--;}
    }

    //Farm Team Infos
    let teams_events = this.FarmTeams(missionteams, max_teams);
    gs.teams = teams_events.teams;
    gs.teamtype = teams_events.teamtype;
    gs.events = teams_events.events;


    gs.events.sort(this.SortByTimeInSeconds);
    gs.events = this.CleanEventsOfDoubles(gs.events);

    let tkd = this.FarmEvents(gs.events);
    gs.kills = tkd.kills;
    gs.deaths = tkd.deaths;
    gs.teamkills = tkd.teamkills;
    let props_to_sum_up = ["gold", "xp"];
    //mission acoolades
    let ma_requests =
    [
      {"marker": "accolade_killed_spider", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"spider", "override_value": true},
      {"marker": "accolade_killed_butcher", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"butcher", "override_value": true},
      {"marker": "accolade_killed_assassin", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"assassin", "override_value": true},
      {"marker": "accolade_killed_rotjaw", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"rotjaw", "override_value": true},
      {"marker": "accolade_banished_spider", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"spider", "override_value": true},
      {"marker": "accolade_banished_butcher", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"butcher", "override_value": true},
      {"marker": "accolade_banished_assassin", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"assassin", "override_value": true},
      {"marker": "accolade_banished_rotjaw", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"rotjaw", "override_value": true},
      {"marker": "accolade_clues_found", "source_prop": "category", "source_value":"hits","target_prop": "clues", "value_type": "int"},
      {"marker": "accolade_monsters_killed", "source_prop": "category", "source_value":"hits","target_prop": "total_monsterskilled", "value_type": "int"},
      {"marker": "accolade_players_killed_assist", "source_prop": "category", "source_value":"hits","target_prop": "assists", "value_type": "int"},
      {"marker": "accolade_reviver", "source_prop": "category", "source_value":"hits","target_prop": "revives", "value_type": "int"},
      {"marker": "accolade_extract_one_token", "source_prop": "category", "target_prop": "bountys", "override_value": 1},
      {"marker": "accolade_extract_two_tokens", "source_prop": "category", "target_prop": "bountys", "override_value": 2},
      {"marker": "accolade_extract_three_tokens", "source_prop": "category", "target_prop": "bountys", "override_value": 3},
      {"marker": "accolade_extract_four_tokens", "source_prop": "category", "target_prop": "bountys", "override_value": 4},
      {"marker": "accolade_extract_five_tokens", "source_prop": "category", "target_prop": "bountys", "override_value": 4},
      {"marker": "accolade_extraction", "source_prop": "category", "target_prop": "teamextraction", "override_value": "solo"}
    ];
    let ma_stats = this.FarmMissionEntry(missionaccolades, max_accolades, ma_requests, "accolade");
    for (let prop in ma_stats)
    {
      if (props_to_sum_up.includes(prop))
      {
        gs[prop] += ma_stats[prop];
        continue;
      }
      gs[prop] = ma_stats[prop];
    }
    //missionbags
    let mb_requests =
    [
      {"marker": "accolade_killed_spider", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"spider", "override_value": true},
      {"marker": "accolade_killed_butcher", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"butcher", "override_value": true},
      {"marker": "accolade_killed_assassin", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"assassin", "override_value": true},
      {"marker": "accolade_killed_scrapbeak", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"scrapbeak", "override_value": true},
      {"marker": "accolade_killed_rotjaw", "source_prop": "category", "target_prop": "bosseskilled", "target_prop2":"rotjaw", "override_value": true},
      {"marker": "accolade_banished_spider", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"spider", "override_value": true},
      {"marker": "accolade_banished_butcher", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"butcher", "override_value": true},
      {"marker": "accolade_banished_assassin", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"assassin", "override_value": true},
      {"marker": "accolade_banished_scrapbeak", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"scrapbeak", "override_value": true},
      {"marker": "accolade_banished_rotjaw", "source_prop": "category", "target_prop": "bossesbanished", "target_prop2":"rotjaw", "override_value": true},
      {"marker": "accolade_contract_spider", "source_prop": "category", "target_prop": "bossesextracted", "target_prop2":"spider", "source_value":"amount", "value_type": "int"},
      {"marker": "accolade_contract_butcher", "source_prop": "category", "target_prop": "bossesextracted", "target_prop2":"butcher", "source_value":"amount", "value_type": "int"},
      {"marker": "accolade_contract_assassin", "source_prop": "category", "target_prop": "bossesextracted", "target_prop2":"assassin", "source_value":"amount", "value_type": "int"},
      {"marker": "accolade_contract_scrapbeak", "source_prop": "category", "target_prop": "bossesextracted", "target_prop2":"scrapbeak", "source_value":"amount", "value_type": "int"},
      {"marker": "accolade_contract_rotjaw", "source_prop": "category", "target_prop": "bossesextracted", "target_prop2":"rotjaw", "source_value":"amount", "value_type": "int"},
      {"marker": "kill grunt", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "grunt", "value_type": "int"},
      {"marker": "kill armored", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "armored", "value_type": "int"},
      {"marker": "kill hive", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "hive", "value_type": "int"},
      {"marker": "kill hellhound", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "hellhound", "value_type": "int"},
      {"marker": "kill immolator", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "immolator", "value_type": "int"},
      {"marker": "kill waterdevil", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "waterdevil", "value_type": "int"},
      {"marker": "kill meathead", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "meathead", "value_type": "int"},
      {"marker": "kill leeches", "source_prop": "descriptorName", "source_value":"amount","target_prop": "monsterskilled","target_prop2": "leech", "value_type": "int"},
      {"marker": "kill horse", "source_prop": "descriptorName", "source_value":"amount","target_prop": "animalskilled","target_prop2": "horse", "value_type": "int"},
      {"marker": "kill raven", "source_prop": "descriptorName", "source_value":"amount","target_prop": "animalskilled","target_prop2": "crow", "value_type": "int"},
      {"marker": "kill duck", "source_prop": "descriptorName", "source_value":"amount","target_prop": "animalskilled","target_prop2": "duck", "value_type": "int"},
      {"marker": "successful extraction", "source_prop": "descriptorName", "target_prop": "teamextraction", "override_value": "team"},
      //{"marker": "accolade_hunter_points", "source_prop": "category",  "source_value":"rewardSize","target_prop": "hunter_points", "value_type": "int"},
      {"marker": "accolade_clues_found", "source_prop": "category",  "source_value":"rewardSize","target_prop": "mb_gold", "value_type": "int"}
    ];
    let mb_stats= this.FarmMissionEntry(missionbags, max_bags, mb_requests, "missionbag");
    for (let prop in mb_stats)
    {
      gs[prop] = mb_stats[prop];
    }

    gs.xp += gs.gold_bounty *4;
    gs.gold = (gs.gold_fbe + gs.gold_bounty + gs.gold_found);

    delete gs.gold_fbe;
    delete gs.gold_bounty;
    delete gs.gold_found;

    gs = this.CleanObject(gs);
    return gs;
  }

}
