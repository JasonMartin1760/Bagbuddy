/**
 * Homepage "What customers say" section.
 *
 * TODO(Jason): these are PLACEHOLDER quotes, not real reviews. Replace them
 * with real customer quotes (first name only, with permission) and set
 * `placeholder` to false. While `placeholder` is true the site shows
 * "Sample reviews. Real customer reviews coming soon." under the quotes.
 */

export interface Testimonial {
  quote: string;
  /** First name only. */
  name: string;
}

export const TESTIMONIALS: {
  placeholder: boolean;
  items: readonly Testimonial[];
} = {
  placeholder: true,
  items: [
    {
      quote:
        'Filled the bag over two weekends cleaning out the garage, booked a pickup, and it was gone the next morning. Way easier than renting a dumpster.',
      name: 'Mike',
    },
    {
      quote:
        'The bag fit right in our driveway next to the car, and the crane truck lifted it out without touching the lawn. Super clean job.',
      name: 'Sarah',
    },
    {
      quote:
        'Fair price, no rental clock ticking, and booking took two minutes. We will use Bag Buddy again for the basement remodel.',
      name: 'Daniel',
    },
  ],
};
