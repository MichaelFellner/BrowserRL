from collections import defaultdict
import numpy as np

BOX_SIZE = 20
DIRECTIONS = {
    0: (0, -BOX_SIZE),   # up
    1: (0,  BOX_SIZE),   # down
    2: (-BOX_SIZE, 0),   # left
    3: ( BOX_SIZE, 0)    # right
}

class ValueIteration:
    def __init__(self, walkable_mask: np.ndarray, goal_pos: tuple, 
                 gamma=0.99, threshold=1e-8, box_size=20):
        self.walkable = walkable_mask      # 2D boolean array: True for walkable (white)
        self.goal = goal_pos              # Goal position (x, y) in pixel coordinates
        self.gamma = gamma
        self.threshold = threshold
        self.box_size = box_size
        self.values = defaultdict(float)  # State-value function: V(x,y)
        self.policy = {}                  # Optimal policy: maps (x,y) -> action

    def is_valid(self, x: int, y: int) -> bool:
        """Check if the (x, y) position is within bounds and not a black (illegal) pixel."""
        h, w = self.walkable.shape  # image shape: (height, width)
        return 0 <= x < w and 0 <= y < h and self.walkable[y, x]

    def iterate(self):
        # Iterate value function until convergence
        while True:
            delta = 0
            new_values = defaultdict(float)

            # Loop through all possible agent positions aligned to the grid (20px spacing)
            for y in range(0, self.walkable.shape[0], self.box_size):
                for x in range(0, self.walkable.shape[1], self.box_size):
                    if not self.is_valid(x, y):
                        continue  # skip black/unwalkable positions

                    max_value = float('-inf')
                    best_action = None

                    # Current distance from this state to goal
                    current_dist = np.linalg.norm([x - self.goal[0], y - self.goal[1]])

                    # Evaluate all possible actions from (x, y)
                    for action, (dx, dy) in DIRECTIONS.items():
                        nx, ny = x + dx, y + dy
                        if not self.is_valid(nx, ny):
                            # Movement into black or out of bounds is not allowed
                            # Skip this action (agent cannot move into black)
                            continue

                        # Compute new distance to goal from the next state
                        new_dist = np.linalg.norm([nx - self.goal[0], ny - self.goal[1]])

                        # Reward is positive if we moved closer, otherwise 0 or negative
                        reward = current_dist - new_dist

                        # If the next state is within one box of the goal, treat as goal reached
                        if new_dist < self.box_size:
                            # Terminal transition – episode ends upon reaching goal
                            value = reward  # no future value beyond reaching goal
                        else:
                            # Add discounted value of the next state
                            value = reward + self.gamma * self.values[(nx, ny)]

                        # Select the action with the highest value
                        if value > max_value:
                            max_value = value
                            best_action = action

                    # Update the value function and policy for state (x, y)
                    if best_action is None:
                        # No valid moves (e.g., isolated area) – no action available
                        self.policy.pop((x, y), None)
                        continue

                    new_values[(x, y)] = max_value
                    self.policy[(x, y)] = best_action
                    delta = max(delta, abs(self.values[(x, y)] - max_value))

            # Update values and check for convergence
            self.values = new_values
            if delta < self.threshold:
                break

    def get_policy(self):
        """
        Return the optimal policy as a dict with keys as "x,y" strings and values as action indices.
        Only positions that are walkable and evaluated will appear.
        """
        return {f"{x},{y}": action for (x, y), action in self.policy.items()}
