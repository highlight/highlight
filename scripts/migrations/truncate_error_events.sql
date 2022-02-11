update error_groups
set event = left(event, 10000)
from error_groups
where length(event) > 10000;
