import { Match } from '../entities/match.entity';
import { PublicUserDto, toPublicUserDto } from '../../users/dto/me.dto';

/**
 * Match as exposed over the API: the `userA` / `userB` relations are narrowed
 * to the public user shape so responses never leak the other participant's PII
 * (email, birthdate, role, ...). Garments are passed through (their owner
 * relation is not loaded here).
 */
export type MatchDto = Omit<Match, 'userA' | 'userB'> & {
  userA?: PublicUserDto;
  userB?: PublicUserDto;
};

export function toMatchDto(match: Match): MatchDto {
  const { userA, userB, ...rest } = match;
  return {
    ...rest,
    userA: userA ? toPublicUserDto(userA) : undefined,
    userB: userB ? toPublicUserDto(userB) : undefined,
  };
}
