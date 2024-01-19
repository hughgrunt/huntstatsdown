const GLOBALS =
{
  TIMER:
  {
    CHECKFORNEWGAME : null
  },
  CONFIG : {},
  DATA : {},
  FILEAGE:
  {
    GAMELOG: 0,
    ATTRIBUTES: 0
  },
  SETTINGS:
  {
    FEEDBACK_POPUPCOLOR: "#711D1D",
    USECUSTOMBACKGROUNDS: false,
    CARDHEIGHT: 250,
    BACKGROUNDIMAGEBRIGHTNESS: 0.9
  },
  FILENAMES :
  {
      CONFIG: "./config.json"
  },
  PATHS:
  {
      DATA: "./data/",
      IMAGES: "./images/"
  },
  IMAGES :
  [
    "backgrounds",
    "stillwaterbayou",
    "lawsondelta",
    "desalle",

    "dead_solo",
    "dead_duo",
    "dead_trio",

    "extraction_solo",
    "extraction_duo",
    "extraction_trio",
    "bountysextracted_solo",
    "bountysextracted_duo",
    "bountysextracted_trio",

    "bosseskilled",
    "bossesbanished",
    "bossesextracted",

    "teamkills_duo",
    "teamkills_trio",
    "kills",
    "deaths",
    "assists",
    "revives",

    "gold",
    "clues",

    "monster",
    "grunt",
    "hellhound",
    "hive",
    "horse",
    "immolator",
    "armored",
    "leech",
    "meathead",
    "waterdevil",



    "spider",
    "butcher",
    "assassin",
    "scrapbeak",
    "rotjaw",

    "duck",
    "crow"
  ],
  IMAGE: {},
  IMAGELOADED:{}
}


function Feedback(message)
{
  let e = document.getElementById("feedback");

  let origin_color = e.style.background;
  let now = new Date();
  let hm = (now.getHours() < 10?"0":"") +now.getHours()  + ":"+(now.getMinutes() < 10?"0":"")+ now.getMinutes()+":"+(now.getSeconds()<10?"0":"") + now.getSeconds();



  e.innerHTML = hm +": " +message;

  e.style.transition = "0s";
  e.style.backgroundColor = GLOBALS.SETTINGS.FEEDBACK_POPUPCOLOR;


  setTimeout(function(){e.style.transition = "3s";e.style.backgroundColor = origin_color;}, 1000);



}
