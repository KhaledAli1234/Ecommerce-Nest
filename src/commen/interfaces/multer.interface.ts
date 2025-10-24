export interface IMulterFile extends Express.Multer.File {
  finalPath: string;
}
