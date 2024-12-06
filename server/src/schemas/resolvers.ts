import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User'; // Adjust the import path according to your file structure
import { signToken } from '../services/auth';
import { IResolvers } from '@graphql-tools/utils'; // Updated import

// Define the context type
interface Context {
  user: any; // Replace `any` with the actual type of user if you have it defined
}

const resolvers: IResolvers = {
  Query: {
    me: async (_parent, _args, context: Context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('Not logged in');
    },
  },
  Mutation: {
    login: async (_parent, { email, password }: { email: string, password: string }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addUser: async (_parent, args: { username: string, email: string, password: string }) => {
      const user = await User.create(args);
      const token = signToken(user.username, user.email, user._id);

      return { token, user };
    },
    saveBook: async (_parent, { input }: { input: any }, context: Context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (_parent, { bookId }: { bookId: string }, context: Context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

export default resolvers;






