import mongoose from 'mongoose';
import connectDB from './db';
import { jest } from '@jest/globals';

describe('connectDB', () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const mongooseConnectSpy = jest.spyOn(mongoose, 'connect');

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
    mongooseConnectSpy.mockResolvedValue(mockConnection);

    // Act
    await connectDB();

    // Assert
    expect(mongooseConnectSpy).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Connected To Mongodb Database ${mockConnection.connection.host}`.bgMagenta.white
    );
  });

  it('should log error message when connection fails', async () => {
    // Arrange
    const mockError = new Error('Connection failed');
    mongooseConnectSpy.mockRejectedValue(mockError);

    // Act
    await connectDB();

    // Assert
    expect(mongooseConnectSpy).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Error in Mongodb ${mockError}`.bgRed.white
    );
  });
});
