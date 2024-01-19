function BuildCard(img_name, value, description)
{
  let image =  SelectRandomImage(img_name);
  let h = "";
  h = "<div class='card_frame' style='background-image: url("+'"'+image+'"'+");' title='"+description+"'>"
  if(value)
  {
    h += "<div class='card_value'>"+value+"</div>"
  }
  h += "</div>";
  return h;
}

function BuildBossCard(boss, killed, banished, extracted)
{
  let backgrounds = [];
  let description = boss + ":";
  let icons = "";

  if(extracted)
  {
    backgrounds.push("url("+'"'+SelectRandomImage("bossesextracted")+'"'+")");
    description += " extracted";
  }
  if(banished)
  {
    backgrounds.push("url("+'"'+SelectRandomImage("bossesbanished")+'"'+")");
    description += " banished";
  }
  if(killed)
  {
    backgrounds.push("url("+'"'+SelectRandomImage("bosseskilled")+'"'+")");
    description += " killed";
  }


  backgrounds.push("url("+'"'+SelectRandomImage(boss)+'"'+")");
  let h = "";
  h = "<div class='card_frame' style='background-image: "+backgrounds+";' title='"+description+"'>";
  h += icons;
  h += "</div>";
  return h;
}

function BuildBossCards(bosseskilled, bossesbanished, bossesextracted, height)
{
  let bosses = [];
  let boss_cards = "";
  if (!bosseskilled){bosseskillded = {};}
  if (!bossesbanished){bossesbanished = {};}
  if (!bossesextracted){bossesextracted = {};}
  for (let boss in bosseskilled)
  {
    let Already = false;
    for (let b=0,bL=bosses.length;b<bL;b++)
    {
      if (boss == bosses[b])
      {
        Already = true;
      }
    }
    if (!Already){bosses.push(boss)};
  }
  for (let boss in bossesbanished)
  {
    let Already = false;
    for (let b=0,bL=bosses.length;b<bL;b++)
    {
      if (boss == bosses[b])
      {
        Already = true;
      }
    }
    if (!Already){bosses.push(boss)};
  }
  for (let boss in bossesextracted)
  {
    let Already = false;
    for (let b=0,bL=bosses.length;b<bL;b++)
    {
      if (boss == bosses[b])
      {
        Already = true;
      }
    }
    if (!Already){bosses.push(boss)};
  }

  for (let b=0,bL=bosses.length;b<bL;b++)
  {
    boss_cards += BuildBossCard(bosses[b], (bosseskilled[bosses[b]] || false), (bossesbanished[bosses[b]] || false), (bossesextracted[bosses[b]] || false));
  }
  return boss_cards;

}

function SelectRandomImage(imagename)
{
  if (GLOBALS.IMAGE[imagename])
  {
    return GLOBALS.IMAGE[imagename][(Math.floor(Math.random() * GLOBALS.IMAGE[imagename].length))];
  }
  return "";
}

async function BuildBlobImageURL(image_path)
{
  try
  {
    let image_data = await Neutralino.filesystem.readBinaryFile(image_path);
    let buffer_array = new Uint8Array(image_data);
    var blob = new Blob( [ buffer_array ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageURL = urlCreator.createObjectURL(blob);
    return imageURL;
  }
  catch(e)
  {
    console.log(JSON.stringify(e) + ": " + e.message)
  }
}
