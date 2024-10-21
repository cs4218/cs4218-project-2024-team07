import mongoose from 'mongoose';
import {connectDB} from './db';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

dotenv.config();

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
    const calledWithUrl = mongooseConnectSpy.mock.calls[0][0];
    expect(calledWithUrl).toMatch(/mongodb:\/\/127\.0\.0\.1:\d+\//); // Match dynamic port
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Connected to in-memory MongoDB at ${calledWithUrl}`.bgMagenta.white
    );
  });

  it('should log error message when connection fails', async () => {
    // Arrange
    const mockError = new Error('Connection failed');
    mongooseConnectSpy.mockRejectedValue(mockError);

    // Act
    await connectDB();

    // Assert
    const calledWithUrl = mongooseConnectSpy.mock.calls[0][0];
    expect(calledWithUrl).toMatch(/mongodb:\/\/127\.0\.0\.1:\d+\//); // Match dynamic port
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Error in MongoDB connection: ${mockError}`.bgRed.white
    );
  });
});
