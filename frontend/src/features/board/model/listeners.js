import { postBoard, removeBoard } from '../api/boardApi';

export const registerBoardListeners = (startListening, { notify }) => {
    [
        [postBoard.fulfilled, 'boardSlice.postBoardSucc'],
        [postBoard.rejected, 'boardSlice.postBoardFail'],
        [removeBoard.fulfilled, 'boardSlice.deleteBoardSucc'],
        [removeBoard.rejected, 'boardSlice.deleteBoardFail']
    ].forEach(([actionCreator, message]) => startListening({ actionCreator, effect: () => notify(message) }));
};
