import Song from "../models/song.model";

async function checkDbData() {
  const nonMp3Docs = await Song.find({ title: { $not: /\.mp3$/ } });
  if (nonMp3Docs.length > 0) {
    console.log("Documents with non-mp3 titles:", nonMp3Docs);
  } else {
    console.log("All titles are mp3 files ✅");
  }
}

async function checkDuplicateFiles() {
  const duplicates = await Song.aggregate([
    {
      $group: { _id: "$title", count: { $sum: 1 }, docs: { $push: "$$ROOT" } },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  if (duplicates.length > 0) {
    console.log("Duplicate files found:");
    duplicates.forEach((dup) => {
      console.log(`Title: ${dup._id}`);
      console.log(dup.docs);
    });
  } else {
    console.log("No duplicates found ✅");
  }
}

export default checkDuplicateFiles;

export { checkDbData, checkDuplicateFiles };
