import { DataSource, Repository } from 'typeorm';
import { Swipe } from './entities/swipe.entity';
import { Garment } from '../garments/entities/garment.entity';
import { Match } from '../matches/entities/match.entity';
import { User } from '../users/entities/user.entity';
import { CreateSwipeDto } from './dto/create-swipe.dto';
export interface SwipeResult {
    matched: boolean;
    match: Match | null;
}
export declare class SwipesService {
    private readonly swipes;
    private readonly garments;
    private readonly users;
    private readonly matches;
    private readonly dataSource;
    constructor(swipes: Repository<Swipe>, garments: Repository<Garment>, users: Repository<User>, matches: Repository<Match>, dataSource: DataSource);
    create(userId: string, dto: CreateSwipeDto): Promise<SwipeResult>;
}
