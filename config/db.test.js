// connectDB.test.js
import mongoose from 'mongoose';
import connectDB from './db';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('connectDB', () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log success message when connection is successful', async () => {
    // Arrange
    const mockConnection = {
      connection: {
        host: 'localhost',
      },
    };
    mongoose.connect.mockResolvedValue(mockConnection);

    // Act
    await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Connected To Mongodb Database ${mockConnection.connection.host}`.bgMagenta.white
    );
  });

  it('should log error message when connection fails', async () => {
    // Arrange
    const mockError = new Error('Connection failed');
    mongoose.connect.mockRejectedValue(mockError);

    // Act
    await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Error in Mongodb ${mockError}`.bgRed.white
    );
  });
});
