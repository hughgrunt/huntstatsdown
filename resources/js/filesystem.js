async function FileExists(filepath)
{
  let file ={};
  file.success = false;
  file.reason = "only initiated";
  if (!filepath)
  {
    file.reason = "no path given";
    return file;
  }
  try
  {
    file.stats = await Neutralino.filesystem.getStats(filepath);
    file.success = true;
    file.reason = "file successfully found";
  }
  catch (e)
  {
    file.reason = e.message;
    if (e.code == "NE_FS_NOPATHE")
    {
      file.success = false;
      file.reason = "file does not exist";
    }
  }
  finally
  {
      return file;
  }
}

async function ReadFile(filepath)
{
  let r = {};
  r.success = false;
  r.reason = "only initiated";
  r.content = "";
  try
  {
    r.content = await Neutralino.filesystem.readFile(filepath);
    r.success = true;
    r.reason = "file successfully read";
  }
  catch (e)
  {
    r.success = false;
    r.reason = e.message;
  }
  finally
  {
    return r;
  }
}



async function AppendFile(filepath, data)
{
  let append = {};
  append.success = false;
  append.reason = "only initiated";
  try
  {
    await Neutralino.filesystem.appendFile(filepath, JSON.stringify(data)+"\n");
    append.success = true;
  }
  catch (e)
  {
    append.success = false;
    append.reason = e.message;
  }
  finally
  {
    return append;
  }
}


async function WriteFile(filepath, data)
{
  let write = {};
  write.success = false;
  write.reason = "only initiated";
  try
  {
    await Neutralino.filesystem.writeFile(filepath, JSON.stringify(data));
  }
  catch (e)
  {
    write.success = false;
    write.reason = e.message;
  }
  finally
  {
    return write;
  }
}

async function ReadFilenamesInDir(filepath)
{
  let r = {};
  r.success = false;
  r.reason = "only initiated";
  r.content = "";
  try
  {
    r.content = await Neutralino.filesystem.readDirectory(filepath);
    r.success = true;
    let n = [];
    for (let c in r.content)
    {
      if (r.content[c].type == "FILE")
      {
        n.push(r.content[c].entry);
      }
    }
    r.content = n;
  }
  catch (e)
  {
    r.success = false;
    r.reason = e.message;
  }
  finally
  {
    return r;
  }
}
