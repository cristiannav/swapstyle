import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchDto } from './dto/match.dto';
export declare class MatchesService {
    private readonly matches;
    constructor(matches: Repository<Match>);
    findForUser(userId: string): Promise<MatchDto[]>;
    findOne(id: string, userId: string): Promise<Match>;
    archive(id: string, userId: string): Promise<Match>;
    cancel(id: string, userId: string): Promise<Match>;
}
