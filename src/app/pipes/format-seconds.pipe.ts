import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatSeconds',
  standalone: true
})
export class FormatSecondsPipe implements PipeTransform {
  /**
   * Transforms a number of seconds into a string like "X hr Y min".
   * @param totalSeconds The total seconds to transform.
   * @returns A formatted string.
   */
  transform(totalSeconds: number | undefined | null): string {
    if (totalSeconds === undefined || totalSeconds === null || isNaN(totalSeconds)) {
      return 'N/A';
    }

    if (totalSeconds < 0) {
        return '0 min';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let result = '';
    if (hours > 0) {
      result += `${hours} hr `;
    }
    result += `${minutes} min`;

    return result.trim();
  }
}