#include <assert.h>
#include <stdio.h>
#include <gmp.h>

unsigned long int D[] = {3, 4, 7, 8, 11, 19, 43, 67, 163};

#define PRINTMPZ(X) printf(#X " = "), mpz_out_str(stdout, 10, X), printf("\n");
#define INITMPZ(...) mpz_inits(__VA_ARGS__, NULL)

typedef struct
{
    mpz_t q, t;
} result_t;

result_t next_siec(mpz_t M)
{
    result_t r;
    mpz_t p;
    unsigned long int k;
    mpz_inits(p, r.q, r.t, NULL);
    assert(mpz_cmp_ui(M, 1621) > 0);
    // t = floor(sqrt(4*M - 163))
    mpz_mul_ui(r.t, M, 4);
    mpz_sub_ui(r.t, r.t, 163);
    mpz_sqrt(r.t, r.t);
    mpz_sub_ui(r.t, r.t, 1);
    while (1)
    {
        mpz_add_ui(r.t, r.t, 1);
        for (int i = 0; i < 9; i++)
        {
            unsigned long int d = D[i];
            // q = (t^2 + d)/4
            mpz_pow_ui(r.q, r.t, 2);
            mpz_add_ui(r.q, r.q, d);
            if (mpz_scan1(r.q, 0) < 2)
                continue;
            mpz_divexact_ui(r.q, r.q, 4);
            // assert q >= M
            if (mpz_cmp(r.q, M) < 0)
                continue;
            // p,k = q.perfect_power()
            if (!mpz_perfect_power_p(r.q))
                mpz_set(p, r.q);
            else
                for (k = mpz_sizeinbase(r.q, 2) + 1; k > 0; k--)
                    if (mpz_root(p, r.q, k))
                        break;
            assert(k >= 1);
            if (!mpz_probab_prime_p(p, 64))
                continue;
            mpz_clears(p, NULL);
            return r;
        }
    }
}

int _test_helper(unsigned long int M, unsigned long int want_t, unsigned long int want_q)
{
    result_t r_want;
    mpz_t m;
    mpz_init_set_ui(r_want.t, want_t);
    mpz_init_set_ui(r_want.q, want_q);
    mpz_init_set_ui(m, M);
    result_t r_got = next_siec(m);
    int ok = (mpz_cmp(r_got.q, r_want.q) == 0) && (mpz_cmp(r_got.t, r_want.t) == 0);
    mpz_clears(r_got.q, r_got.t, r_want.q, r_want.t, m, NULL);
    return ok;
}

void test_next_siec()
{
    // next_siec(1000000)// (2001, 1001003)
    assert(_test_helper(1000000, 2001, 1001003));
    // next_siec(100000) // (633, 100183)
    assert(_test_helper(100000, 633, 100183));
    // next_siec(10000)  // (201, 10103)
    assert(_test_helper(10000, 201, 10103));
}

int main()
{
    test_next_siec();
    mpz_t M;
    mpz_init_set_str(M, "100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001", 16);
    result_t r = next_siec(M);
    printf("RESULT\n");
    PRINTMPZ(M);
    PRINTMPZ(r.t);
    PRINTMPZ(r.q);
}