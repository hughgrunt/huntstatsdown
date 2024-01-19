async function PopupMenuLetUserSelectUserFolder()
{
  let user_folder = await Neutralino.os.showFolderDialog('select hunt showdown user folder', {defaultPath: '/home/my/directory/'});
  let IsUserFolderValid = await ValidateUserFolder(user_folder);
  Feedback(IsUserFolderValid.success + " - " + IsUserFolderValid.reason);
  if(IsUserFolderValid.success)
  {
    GLOBALS.CONFIG.PATHS = IsUserFolderValid.paths;
    let w = await WriteFile(GLOBALS.FILENAMES.CONFIG, GLOBALS.CONFIG);
    Feedback(JSON.stringify("writing config " + w));
    LoadMain();
  }
}

async function ValidateUserFolder(user_folder)
{
  let result = {};
  result.success = false;
  result.reason = "nothing done yet";
  let paths = {};
  paths.gamelog = GamelogPathByRoot(user_folder);
  paths.attributes = AttributesPathByRoot(user_folder);
  let gamelog = await FileExists(paths.gamelog);
  if (!gamelog.success){result.reason = "game.log could not be found at" + paths.gamelog; return result;}
  let attributes = await FileExists(paths.attributes);
  if (!attributes.success){result.reason = "attributes.xml could not be found at "+ paths.attributes; return result;}
  result.success = true;
  result.reason = "game.log and attributes.xml both could be found";
  result.paths = paths;
  return result;
}
