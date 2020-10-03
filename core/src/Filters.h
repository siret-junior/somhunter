

/* This file is part of SOMHunter.
 *
 * Copyright (C) 2020 František Mejzlík <frankmejzlik@gmail.com>
 *                    Mirek Kratochvil <exa.exa@gmail.com>
 *                    Patrik Veselý <prtrikvesely@gmail.com>
 *
 * SOMHunter is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 2 of the License, or (at your option)
 * any later version.
 *
 * SOMHunter is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * SOMHunter. If not, see <https://www.gnu.org/licenses/>.
 */

#ifndef FILTERS_H_
#define FILTERS_H_

#include <array>

#include "common.h"
#include "utils.h"

class WeekDaysFilter
{
public:
	/** Default state is all dayes */
	WeekDaysFilter() { _days.fill(true); }

	/** Construct from the bit mask */
	WeekDaysFilter(uint8_t mask)
	{
		// Set the according days, ignore the last 2 bits
		for (size_t i{ 0 }; i < 7; ++i) {
			_days[i] = is_set(mask, i);
		}
	}

	const bool &operator[](size_t i) const { return _days[i]; }

	bool &operator[](size_t i) { return _days[i]; }

	bool operator==(const WeekDaysFilter &other) const
	{
		return (_days == other._days);
	}

private:
	std::array<bool, 7> _days;
};

class TimeFilter
{
public:
	/** Default state is the whole day */
	TimeFilter()
	  : from(0)
	  , to(24){};
	TimeFilter(Hour from, Hour to)
	  : from(from)
	  , to(to){};

	bool operator==(const TimeFilter &other) const
	{
		return (from == other.from && to == other.to);
	}

	Hour from;
	Hour to;
};

/** Container for all the available filters for the rescore */
struct Filters
{
	TimeFilter time;
	WeekDaysFilter days;

	bool operator==(const Filters &other) const
	{
		return (time == other.time && days == other.days);
	}
};
#endif // FILTERS_H_
