BootUp();

async function BootUp()
{
  let data_folder_exists = await FileExists(GLOBALS.PATHS.DATA)
  if(!data_folder_exists.success)
  {
    await Neutralino.filesystem.createDirectory(GLOBALS.PATHS.DATA);
    Feedback("data folder has been created");
  }

  let image_folder_exists = await FileExists(GLOBALS.PATHS.IMAGES);
  if(!image_folder_exists.success)
  {
    await Neutralino.filesystem.createDirectory(GLOBALS.PATHS.IMAGES);
    Feedback("image folder has been created");
  }

  Feedback("loading images");
  for (let i=0,iL=GLOBALS.IMAGES.length;i<iL;i++)
  {
    let i_path = GLOBALS.PATHS.IMAGES+GLOBALS.IMAGES[i]+"/";
    let i_exists = await FileExists(i_path);
    if(!i_exists.success)
    {
      await Neutralino.filesystem.createDirectory(i_path);
      Feedback(GLOBALS.IMAGES[i]+" folder has been created");
      continue;
    }
    GLOBALS.IMAGE[GLOBALS.IMAGES[i]] = [];
    let filenames = await ReadFilenamesInDir(i_path);
    for (let n=0,nL=filenames.content.length;n<nL;n++)
    {
      GLOBALS.IMAGE[GLOBALS.IMAGES[i]].push(await BuildBlobImageURL(i_path+filenames.content[n]));
    }
  }

  let config_exists = await FileExists(GLOBALS.FILENAMES.CONFIG);
  if(!config_exists.success)
  {
    Feedback("Could not read config: " + config_exists.reason +".");
    DrawContent(CreateFormLetUserSelectFolder());
    return;
  }

  let config = await ReadFile(GLOBALS.FILENAMES.CONFIG);
  if (config.success)
  {
    GLOBALS.CONFIG = JSON.parse(config.content);
    Feedback("Config found and loaded.");
    LoadMain();
    return;
  }
  Feedback("Something wrong with configfile: " + config.reason +".");
}

async function LoadMain()
{
  DrawContent(BuildGrid());
  let filenames = await ReadFilenamesInDir(GLOBALS.PATHS.DATA);
  GLOBALS.DATA.ALL = await ReadFilesInDirAsData(filenames, GLOBALS.PATHS.DATA);
  DrawLastGameTo("gamestats", GLOBALS.CONFIG.PATHS.gamelog, GLOBALS.CONFIG.PATHS.attributes);
  GLOBALS.TIMER.CHECKFORNEWGAME = setInterval(CheckForNewGame,5000);
}
