import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MemberRepository } from './user.repository';
import * as bcryptjs from 'bcryptjs';
import { GetUserDto } from '../dto/get-user.dto';
import { CreateMasterDTO } from './dto/create-master.dto';
import { COMPANY_SERVICE, UserDTO } from '@app/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { ADMIN, MEMBER } from '../constant';
import { getGenerateCode } from '../function';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, map, of, switchMap, tap } from 'rxjs';
@Injectable()
export class UsersService {
  @Inject(COMPANY_SERVICE) private readonly company_service: ClientProxy;
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly memberRepository: MemberRepository) {}

  async createMaster(createUserDto: CreateMasterDTO) {
    this.logger.verbose(`${UsersService.name} - createMaster`);
    await this.validateCreateUserDto(createUserDto);
    return this.memberRepository.create({
      ...createUserDto,
      password: await bcryptjs.hash(createUserDto.password, 10),
      memberCode: getGenerateCode(),
      role: ADMIN,
    });
  }

  async getMemberDetail(user: UserDTO, email: string) {
    this.logger.verbose(`${UsersService.name} - getMemberDetail`);

    try {
      const member = await this.memberRepository.findByEmail(email);
      if (!member) {
        throw new NotFoundException('member not found');
      }
      const company = await this.company_service
        .send('get_company', [member.companyCode])
        .pipe(
          tap((res) => {
            this.logger.debug(`Fetched company data: ${JSON.stringify(res)}`);
          }),
          map((res) => {
            return {
              _id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              memberCode: user.memberCode,
              companyCode: user.companyCode,
              companyName: res?.[0]?.companyName || '', // Add companyName to user data
            };
          }),
          catchError((e) => {
            this.logger.error('Error in fetching company data', e);
            return of({
              ...user,
              companyName: '', // Default value if company data fetch fails
            });
          }),
        )
        .toPromise(); // Convert observable to promise
      return company;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getMember(
    user: UserDTO,
    searchValue: string,
    page: number,
    limit: number,
  ) {
    this.logger.verbose(`${UsersService.name} - getMember`);
    const { companyCode } = user;
    const users = await this.memberRepository.getMember(
      companyCode,
      searchValue,
      page,
      limit,
    );

    const companyCodeList = users.paginatedData.map((v) => v.companyCode);

    const company = this.company_service
      .send('get_company', companyCodeList)
      .pipe(
        tap((res) => {}),
        catchError((e) => {
          console.error('Error in catchError:', e);
          return of(null); // Handle error and return a default value or empty observable
        }),
        switchMap((companyData) => {
          // Join user data with company data
          const joinedData = users.paginatedData.map((user) => {
            const company = companyData.find(
              (company) => company.companyCode === user.companyCode,
            );
            return {
              _id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              memberCode: user.memberCode,
              companyCode: user.companyCode,
              companyName: company ? company.companyName : '', // Set companyName or empty string
            };
          });
          this.logger.debug(`Joined data: ${JSON.stringify(joinedData)}`);
          return of({ paginatedData: joinedData });
        }),
      );
    return company;
  }

  async createMember(user: UserDTO, createUserDto: CreateUserDTO) {
    this.logger.verbose(`${UsersService.name} - createMember`);
    const { companyCode } = user;
    await this.validateCreateUserDto(createUserDto);

    return this.memberRepository.create({
      ...createUserDto,
      password: await bcryptjs.hash(createUserDto.password, 10),
      memberCode: getGenerateCode(),
      role: MEMBER,
      companyCode,
    });
  }

  private async validateCreateUserDto(createUserDto) {
    try {
      await this.memberRepository.findOne({ email: createUserDto.email });
    } catch (error) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists');
  }

  async verifyUser(email: string, password: string) {
    const user = await this.memberRepository.findOne({ email });
    const passwordIsValid = await bcryptjs.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async getUser(email: GetUserDto) {
    return this.memberRepository.findOne(email);
  }
}
