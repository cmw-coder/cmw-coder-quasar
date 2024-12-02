import { ReviewData, ReviewState, SelectionData } from 'cmw-coder-subprocess';

export const formatSelection = (selectionData: SelectionData) => {
  return {
    fileName: getFileName(selectionData.file),
    rangeStr: `${selectionData.range.begin.line} - ${selectionData.range.end.line}`,
    ...selectionData,
  };
};

export const getFileName = (filePath: string) => {
  const filePathArr = filePath.split(/[\\/]/);
  return filePathArr[filePathArr.length - 1];
};

export const getProblemNumber = (review: ReviewData) => {
  let result = 0;
  if (review.state === ReviewState.Finished) {
    if (review?.result?.parsed) {
      review.result.data.forEach((item) => {
        if (item.IsProblem) {
          result += 1;
        }
      });
    }
  }
  return result;
};
