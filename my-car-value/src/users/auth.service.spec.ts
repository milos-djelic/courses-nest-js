import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    // Craete a fake copy of the users service
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) =>{
        const user = {id: Math.floor(Math.random() * 999999), email, password} as User;
        users.push(user);
        return Promise.resolve(user);
      }
        
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of a service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email with is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (err) {
      expect(err.message).toEqual('email in use');
    }
  });

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin("asdasd.asdas.com", "asdas");
    } catch(err) {
      expect(err.message).toEqual('user not found');
    }
  });

  it('throws if an invalid password is provided', async() => {
    await service.signup('asdf@asdf.com', 'asdf');
    try {
      await service.signin('asdf@asdf.com', 'password');
    } catch(err) {
      expect(err.message).toEqual('bad password');
    }
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');
    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();

  });
});
