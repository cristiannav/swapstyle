import { SwipesService } from './swipes.service';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import type { JwtPayload } from '../auth/types/jwt-payload';
export declare class SwipesController {
    private readonly swipes;
    constructor(swipes: SwipesService);
    create(user: JwtPayload, dto: CreateSwipeDto): Promise<import("./swipes.service").SwipeResult>;
}
