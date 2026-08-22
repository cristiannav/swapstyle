import { MatchesService } from './matches.service';
import type { JwtPayload } from '../auth/types/jwt-payload';
export declare class MatchesController {
    private readonly matches;
    constructor(matches: MatchesService);
    list(user: JwtPayload): Promise<import("./dto/match.dto").MatchDto[]>;
    detail(user: JwtPayload, id: string): Promise<import("./dto/match.dto").MatchDto>;
    archive(user: JwtPayload, id: string): Promise<import("./dto/match.dto").MatchDto>;
    cancel(user: JwtPayload, id: string): Promise<import("./entities/match.entity").Match>;
}
