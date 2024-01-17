import { ID, storage } from '@/appwrite';

const uploadImage = async (file: File) => {
  if (!file) return;

  const fileUploaded = await storage.createFile(
    '652d828dc7ae2817c377',
    ID.unique(),
    file
  );

  // console.log(fileUploaded);
  return fileUploaded;
};

export default uploadImage;
