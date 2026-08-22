import { Match } from '../entities/match.entity';
import { PublicUserDto } from '../../users/dto/me.dto';
export type MatchDto = Omit<Match, 'userA' | 'userB'> & {
    userA?: PublicUserDto;
    userB?: PublicUserDto;
};
export declare function toMatchDto(match: Match): MatchDto;
